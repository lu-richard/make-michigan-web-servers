from django.contrib.auth.middleware import RemoteUserMiddleware


class ProxyRemoteUserMiddleware(RemoteUserMiddleware):
    # Set by the frontend Apache from the OIDC session; the backend is only reachable through that proxy.
    header = "HTTP_X_REMOTE_USER"
