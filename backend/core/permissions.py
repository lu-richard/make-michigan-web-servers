from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import Role

# These replace the Supabase RLS policies. Django connects to MySQL as a single database user, so the database can't
# tell users apart; each request's user (from the Okta identity Apache forwards) is checked here instead.


class RoleWriteOrReadOnly(BasePermission):
    """Any signed-in user can read; only users holding one of the view's write_roles can create, update or delete.
    The default for every viewset (settings.REST_FRAMEWORK), matching the 'Allow staff to ...' policies."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return request.user.has_any_role(*getattr(view, 'write_roles', [Role.STAFF]))


class IsOwnerOrStaff(BasePermission):
    """Users can only create, update or delete rows they own (the view's owner_field holds their user_id); staff can
    write any row. Matches the '... own ... only, unless staff' policies, including their WITH CHECK half: a user
    can't create a row for someone else or hand their row to someone else."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS or request.user.has_any_role(Role.STAFF):
            return True

        if request.method == 'POST':
            return self._claims_self(request, view, required=True)

        # Updates and deletes are decided per row in has_object_permission.
        return True

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS or request.user.has_any_role(Role.STAFF):
            return True

        return getattr(obj, view.owner_field) == request.user.pk and self._claims_self(request, view, required=False)

    def _claims_self(self, request, view, required):
        owner = request.data.get(view.owner_field)

        if owner is None:
            return not required

        return str(owner) == str(request.user.pk)
