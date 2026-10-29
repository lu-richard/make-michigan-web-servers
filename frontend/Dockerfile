# syntax=docker/dockerfile:1
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
# npm ci installs exactly from the lockfile; the cache mount keeps downloaded packages between builds.
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM httpd:2.4

RUN apt-get update && apt-get install -y libapache2-mod-auth-openidc \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s "$(dpkg -L libapache2-mod-auth-openidc | grep '\.so$')" /usr/local/apache2/modules/mod_auth_openidc.so

COPY --from=build /app/dist /usr/local/apache2/htdocs/
COPY httpd.conf /usr/local/apache2/conf/httpd.conf
COPY auth_openidc.conf /usr/local/apache2/conf/extra/auth_openidc.conf
EXPOSE 80
