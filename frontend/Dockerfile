# syntax=docker/dockerfile:1
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
# npm ci installs exactly from the lockfile; the cache mount keeps downloaded packages between builds.
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM httpd:2.4
COPY httpd.conf /usr/local/apache2/conf/httpd.conf
COPY --from=build /app/dist /usr/local/apache2/htdocs/
EXPOSE 80
