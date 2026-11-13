#!/usr/bin/env bash
# Deploys one image tag of the admin panel on this server, and rolls back to the version that was
# running when the new one doesn't pass its healthcheck in time.
#
# Run by the deploy job of .github/workflows/dev.yml and main.yml, on the server's self-hosted
# runner, from a checkout of deploy/. It installs the repo's compose file in DEPLOY_DIR, so the
# compose file on the server is always the one of the commit being deployed.
#
# Environment (all required unless a default is given):
#   DEPLOY_DIR      folder on the server that holds the compose project and its .env
#   COMPOSE_SRC     compose file in the checkout, e.g. deploy/docker-compose.prod.yml
#   CONTAINER       container_name in that compose file: fe-dashboard
#   NETWORK         external Docker network that compose file joins, e.g. pakargaming-prod
#   IMAGE_REPO      ghcr.io/<owner>/<repo>, lowercase
#   NEW_TAG         image tag to deploy, e.g. prod-1.2.3
#   TAG_PREFIX      prod- or dev-; older images with it are removed after a good deploy
#   GHCR_USER, GHCR_TOKEN   registry login for the pull
#   HEALTH_TIMEOUT  seconds the new version gets to report healthy, default 90. The compose file's
#                   healthcheck first probes 10s after start and calls it unhealthy after ~40s.
#   KEEP_IMAGES     versions of the image kept on disk for a rollback, default 3
#
# The health check is the container's own (healthcheck in the compose file, a request to nginx
# inside it), not a request to the host port: that port, and the address it is bound to, are the
# server's choice (FE_PUBLISH in DEPLOY_DIR/.env).
set -euo pipefail

: "${DEPLOY_DIR:?}" "${COMPOSE_SRC:?}" "${CONTAINER:?}" "${NETWORK:?}" "${IMAGE_REPO:?}"
: "${NEW_TAG:?}" "${TAG_PREFIX:?}" "${GHCR_USER:?}" "${GHCR_TOKEN:?}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-90}"
KEEP_IMAGES="${KEEP_IMAGES:-3}"

# The compose file is used as docker-compose.yml in DEPLOY_DIR; the one it replaces is kept beside
# it as docker-compose.yml.previous, which a rollback puts back.
COMPOSE_NAME="docker-compose.yml"
COMPOSE_PREVIOUS="docker-compose.yml.previous"
COMPOSE_SRC="$(realpath "$COMPOSE_SRC")"

# compose reads IMAGE_REPO and IMAGE_TAG from the environment (see the compose file).
export IMAGE_REPO

compose() {
  docker compose -f "$COMPOSE_NAME" "$@"
}

# container_state prints the container's state for the job log.
container_state() {
  docker inspect --format 'state={{.State.Status}} health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}} restarts={{.RestartCount}} exit_code={{.State.ExitCode}} image={{.Config.Image}}' "$CONTAINER" 2>/dev/null ||
    echo "container $CONTAINER not found"
}

# wait_healthy waits until the container's healthcheck says healthy, and gives up when it says
# unhealthy, the container is gone, or HEALTH_TIMEOUT seconds pass. A container without a
# healthcheck (started from a compose file from before this script, which is what a rollback can
# bring back) only has to stay running, without restarting, for 10s.
wait_healthy() {
  local deadline=$((SECONDS + HEALTH_TIMEOUT))
  local status health restarts
  while [ "$SECONDS" -lt "$deadline" ]; do
    read -r status health restarts < <(
      docker inspect --format '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}} {{.RestartCount}}' "$CONTAINER" 2>/dev/null ||
        echo "missing missing 0"
    ) || true
    case "$status/$health" in
      running/healthy)
        echo "Healthy after ${SECONDS}s"
        return 0
        ;;
      */unhealthy | missing/*)
        return 1
        ;;
      running/none)
        sleep 10
        if [ "$(docker inspect --format '{{.State.Status}} {{.RestartCount}}' "$CONTAINER" 2>/dev/null)" = "running $restarts" ]; then
          echo "Running after ${SECONDS}s (it has no healthcheck, so that is all there is to check)"
          return 0
        fi
        ;;
    esac
    sleep 3
  done
  return 1
}

# show_output prints the end of the failed container's output, which names why it didn't start
# (nginx refusing the rendered config, a port already taken). Called only when the new version
# failed, before the rollback replaces the container and its output with it.
show_output() {
  echo "   Last lines of its output:"
  docker logs --tail 30 "$CONTAINER" 2>&1 | sed 's/^/   | /' || true
}

printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
# Leave no registry credential behind on the server.
trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT

if ! docker network inspect "$NETWORK" >/dev/null 2>&1; then
  echo "Creating network $NETWORK..."
  docker network create --driver bridge --subnet 172.20.0.0/16 "$NETWORK"
fi

cd "$DEPLOY_DIR"

# The version running now is the rollback target. Before this script managed the compose file,
# the image was a moving *-latest tag; that tag is never pulled again here, so locally it still
# names the old image and is a valid rollback target as well.
CURRENT_IMAGE="$(docker inspect --format '{{.Config.Image}}' "$CONTAINER" 2>/dev/null || true)"
CURRENT_TAG=""
case "$CURRENT_IMAGE" in
  *:*) CURRENT_TAG="${CURRENT_IMAGE##*:}" ;;
esac
echo "Current: ${CURRENT_IMAGE:-none}"
echo "New:     $IMAGE_REPO:$NEW_TAG"

# The rollback goes by the running image's ID, tagged <prefix>previous here, not by its tag: a tag
# can be pushed again and then names the new image.
ROLLBACK_TAG="${TAG_PREFIX}previous"
CURRENT_IMAGE_ID="$(docker inspect --format '{{.Image}}' "$CONTAINER" 2>/dev/null || true)"
if [ -n "$CURRENT_IMAGE_ID" ]; then
  docker tag "$CURRENT_IMAGE_ID" "$IMAGE_REPO:$ROLLBACK_TAG"
fi

# Pulled before anything on the server changes, so a failed pull leaves it as it was.
echo "Pulling $NEW_TAG..."
docker pull "$IMAGE_REPO:$NEW_TAG"

# FE_PUBLISH and BACKEND_URL are the server's (see the compose file). When .env doesn't set them,
# they are taken from the container running now and written to .env, so the first deploy with the
# repo's compose file keeps the port the reverse proxy sends traffic to, and the backend nginx
# forwards to. Nothing to take means: FE_PUBLISH is missing (compose config below stops the
# deploy), BACKEND_URL falls back to the compose file's default.
env_has() {
  [ -f .env ] && grep -Eq "^[[:space:]]*(export[[:space:]]+)?$1=" .env
}

carry_over() {
  local name="$1" value="$2"
  if env_has "$name" || [ -z "$value" ]; then
    return 0
  fi
  echo "$name is not in $DEPLOY_DIR/.env; keeping what $CONTAINER uses now: $name=$value"
  export "$name=$value"
  if ! printf "\n# Taken by deploy/deploy.sh on %s from the container running then.\n%s='%s'\n" \
    "$(date -u +%F)" "$name" "$value" >>.env 2>/dev/null; then
    echo "⚠️ Could not write it to $DEPLOY_DIR/.env; add $name='$value' there by hand"
  fi
}

# current_publish prints the host side of the container's mapping of port 80 as compose writes it:
# 4173 (every address) or 127.0.0.1:4173. Nothing when the container or the mapping isn't there.
current_publish() {
  local ip="" port=""
  read -r ip port < <(
    docker inspect --format '{{with index .HostConfig.PortBindings "80/tcp"}}{{with index . 0}}{{if .HostIp}}{{.HostIp}}{{else}}-{{end}} {{.HostPort}}{{end}}{{end}}' "$CONTAINER" 2>/dev/null || true
  ) || true
  if [ -z "$port" ]; then
    return 0
  fi
  case "$ip" in
    -) echo "$port" ;;
    *:*) echo "[$ip]:$port" ;;
    *) echo "$ip:$port" ;;
  esac
}

current_backend_url() {
  docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' "$CONTAINER" 2>/dev/null |
    sed -n 's/^BACKEND_URL=//p' | head -n 1
}

carry_over FE_PUBLISH "$(current_publish)"
carry_over BACKEND_URL "$(current_backend_url)"

# Keep the compose file now in use (whatever its name, in compose's own order of preference) for a
# rollback, then make docker-compose.yml the only one, so a manual `docker compose` on the server
# uses the same file.
rm -f "$COMPOSE_PREVIOUS"
for f in compose.yaml compose.yml docker-compose.yaml docker-compose.yml; do
  if [ -f "$f" ]; then
    cp "$f" "$COMPOSE_PREVIOUS"
    break
  fi
done

restore_compose() {
  if [ -f "$COMPOSE_PREVIOUS" ]; then
    cp "$COMPOSE_PREVIOUS" "$COMPOSE_NAME"
  fi
}

for f in compose.yaml compose.yml docker-compose.yaml; do
  if [ -f "$f" ]; then
    echo "Moving $f aside to $f.replaced; $COMPOSE_NAME from the repo replaces it"
    mv "$f" "$f.replaced"
  fi
done
install -m 0644 "$COMPOSE_SRC" "$COMPOSE_NAME"

# A compose file that doesn't parse, or a missing FE_PUBLISH, stops here, before the running
# container is touched.
if ! IMAGE_TAG="$NEW_TAG" compose config --quiet; then
  echo "❌ $COMPOSE_SRC does not resolve on this server; the server's previous compose file is back in place."
  echo "   If FE_PUBLISH is missing: add the host port the reverse proxy sends the panel to, e.g."
  echo "   FE_PUBLISH=127.0.0.1:4173, to $DEPLOY_DIR/.env"
  restore_compose
  exit 1
fi

# rollback starts the version that was running before, with the compose file it ran with, and
# fails the job either way.
rollback() {
  if [ -z "$CURRENT_IMAGE_ID" ]; then
    echo "⚠️ No version was running before this one, so there is nothing to roll back to"
    exit 1
  fi

  echo "Rolling back to $CURRENT_TAG (image ${CURRENT_IMAGE_ID#sha256:})..."
  restore_compose
  # A compose file from before this script names a fixed *-latest image and ignores IMAGE_TAG;
  # that tag is never pulled here, so it still names the old image.
  IMAGE_TAG="$ROLLBACK_TAG" compose up -d --remove-orphans || true

  SECONDS=0
  if wait_healthy; then
    echo "🔄 Rolled back to $CURRENT_TAG, which is up"
  else
    echo "❌ The rollback to $CURRENT_TAG is not healthy either: $(container_state)"
  fi
  exit 1
}

echo "Starting $NEW_TAG..."
if ! IMAGE_TAG="$NEW_TAG" compose up -d --remove-orphans; then
  echo "❌ docker compose up failed: $(container_state)"
  show_output
  rollback
fi

RUNNING_IMAGE="$(docker inspect --format '{{.Config.Image}}' "$CONTAINER" 2>/dev/null || true)"
if [ "$RUNNING_IMAGE" != "$IMAGE_REPO:$NEW_TAG" ]; then
  echo "❌ $CONTAINER runs ${RUNNING_IMAGE:-nothing}, not $IMAGE_REPO:$NEW_TAG: check container_name and image in $COMPOSE_SRC"
  rollback
fi

echo "Waiting up to ${HEALTH_TIMEOUT}s for $CONTAINER to report healthy..."
SECONDS=0
if ! wait_healthy; then
  echo "❌ $NEW_TAG did not become healthy in ${HEALTH_TIMEOUT}s: $(container_state)"
  show_output
  rollback
fi

# For a manual `docker compose` on the server: IMAGE_TAG=$(cat .deployed-tag) docker compose up -d
printf '%s\n' "$NEW_TAG" >.deployed-tag

# docker image prune only removes untagged images, and every deploy leaves a tagged one behind.
# Keep the newest KEEP_IMAGES versions, and always the one now running and the rollback target.
echo "Removing old images, keeping the newest $KEEP_IMAGES..."
docker image ls "$IMAGE_REPO" --format '{{.Tag}}' |
  { grep -E "^${TAG_PREFIX}[0-9]+\.[0-9]+\.[0-9]+$" || true; } |
  sort -V -r |
  tail -n +"$((KEEP_IMAGES + 1))" |
  while read -r tag; do
    if [ "$tag" = "$NEW_TAG" ] || [ "$tag" = "$CURRENT_TAG" ]; then
      continue
    fi
    docker image rm "$IMAGE_REPO:$tag" >/dev/null || echo "Could not remove $tag (still in use?)"
  done
docker image prune -f

echo "Deployment of $NEW_TAG succeeded 🚀"
