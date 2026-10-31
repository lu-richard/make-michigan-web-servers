from django.contrib.auth.backends import RemoteUserBackend


class ProxyRemoteUserBackend(RemoteUserBackend):
    """Logs users in from the uniqname the frontend Apache forwards (see core.middleware), creating their
    profile on first login from the Okta name claims Apache forwards alongside it (see frontend/httpd.conf)."""

    def clean_username(self, username):
        # Apache already strips @umich.edu (OIDCRemoteUserClaim); this keeps a full email from ever becoming a uniqname.
        return username.split('@')[0].lower()

    def configure_user(self, request, user, created=True):
        if created:
            meta = request.META
            user.first_name = meta.get('HTTP_X_REMOTE_GIVEN_NAME', '')[:100]
            user.middle_initial = meta.get('HTTP_X_REMOTE_MIDDLE_NAME', '')[:1] or None
            user.last_name = meta.get('HTTP_X_REMOTE_FAMILY_NAME', '')[:100]
            # Okta is the only way in, so there's never a Django password.
            user.set_unusable_password()
            user.save()

        return user
