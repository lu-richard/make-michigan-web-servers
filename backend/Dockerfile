# syntax=docker/dockerfile:1
FROM httpd:2.4

RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-dev \
    apache2-dev build-essential \
    libapache2-mod-auth-openidc \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install --break-system-packages mod_wsgi

# Apache module/config wiring doesn't depend on app code, so keep it above COPY . to stay cached.
RUN MOD_WSGI_SO=$(mod_wsgi-express module-config | grep -oP "(?<=LoadModule wsgi_module \")[^\"]+") \
    && echo "LoadModule wsgi_module $MOD_WSGI_SO" >> /usr/local/apache2/conf/httpd.conf

RUN AUTH_OPENIDC_SO=$(dpkg -L libapache2-mod-auth-openidc | grep '\.so$') \
    && echo "LoadModule auth_openidc_module $AUTH_OPENIDC_SO" >> /usr/local/apache2/conf/httpd.conf

RUN echo "Include conf/extra/django.conf" >> /usr/local/apache2/conf/httpd.conf

WORKDIR /app
COPY requirements.txt /app/requirements.txt
# Cache mount keeps downloaded wheels between builds, so a requirements change only fetches what's new.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install --break-system-packages --ignore-installed -r requirements.txt

ENV SECRET_KEY=build-time-placeholder-not-used-at-runtime
ENV DEBUG=False
ENV ALLOWED_HOSTS=localhost
ENV DATABASE_URL=mysql://user:pass@localhost:3306/placeholder
ENV DEFAULT_THROTTLE_ANON=100/day
ENV DEFAULT_THROTTLE_USER=1000/day
ENV CORS_ALLOWED_ORIGINS=http://localhost

COPY httpd.conf /usr/local/apache2/conf/extra/django.conf
COPY . /app/

RUN python3 manage.py collectstatic --noinput

EXPOSE 80
