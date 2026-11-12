# Node 24 LTS, pinned by version and digest (multi-arch index); it bundles Yarn 1.22.22, which yarn.lock needs.
FROM node:24.22.3-alpine3.24@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5 AS builder

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# nginx stable, the upstream image that runs as the unprivileged `nginx` user (uid 101) instead of root.
# It still listens on 80, so port mappings stay as they are: Docker 20.10+ lets non-root processes
# in a container bind ports below 1024 (net.ipv4.ip_unprivileged_port_start=0 by default).
FROM nginxinc/nginx-unprivileged:1.30.6-alpine3.24@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03

COPY --from=builder /app/dist /usr/share/nginx/html

COPY default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
