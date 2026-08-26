FROM node:24-alpine AS builder

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn test
RUN yarn build

FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]