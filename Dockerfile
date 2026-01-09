# ===== BUILD STAGE =====
FROM node:25-alpine AS build
WORKDIR /app

# copy dependency files
COPY package.json yarn.lock ./

# install deps
RUN yarn install --frozen-lockfile

# copy source
COPY . .
RUN yarn build

# ===== PRODUCTION STAGE =====
FROM nginx:alpine

# hapus default config
RUN rm /etc/nginx/conf.d/default.conf

# copy hasil build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
