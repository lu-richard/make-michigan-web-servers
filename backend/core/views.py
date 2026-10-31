from django.http import Http404
from django.middleware.csrf import get_token
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from django_filters import rest_framework as django_filters

from .serializers import *
from .permissions import IsOwnerOrStaff

# Custom Pagination Styles

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'

# Custom Filters

class UUIDInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    """Supports ?field__in=id1,id2,id3 for UUID/text primary/foreign key columns."""
    pass

class CredentialModelFilter(django_filters.FilterSet):
    credential_model_id__in = UUIDInFilter(field_name='credential_model_id')

    class Meta:
        model = CredentialModel
        fields = ['credential_model_id']

class CredentialModelPrerequisiteFilter(django_filters.FilterSet):
    dependent_credential_model_id__in = UUIDInFilter(field_name='dependent_credential_model_id')

    class Meta:
        model = CredentialModelPrerequisite
        fields = ['dependent_credential_model_id']

# Custom Mixins

class CompositeKeyLookupMixin:
    """Looks up a single row of a CompositePrimaryKey table from URL kwargs named after its key columns,
    e.g. profiles/<user_id>/pinned-equipment/<equipment_id>/ (see urls.py)."""
    composite_key_fields = []

    def get_queryset(self):
        # Nested routes scope rows to the parent in the URL, e.g. profiles/<user_id>/pinned-equipment/ lists one user's pins.
        scope = {field: self.kwargs[field] for field in self.composite_key_fields if field in self.kwargs}
        return super().get_queryset().filter(**scope)

    def get_object(self):
        # The router's flat /<prefix>/<pk>/ route can't address a multi-column key.
        if not all(field in self.kwargs for field in self.composite_key_fields):
            raise Http404

        lookup = {field: self.kwargs[field] for field in self.composite_key_fields}
        obj = get_object_or_404(self.filter_queryset(self.get_queryset()), **lookup)
        self.check_object_permissions(self.request, obj)
        return obj

class OwnRowsUnlessStaffMixin:
    """Non-staff users only see rows they own (owner_field holds their user_id); staff see everything."""
    owner_field = None

    def get_queryset(self):
        queryset = super().get_queryset()

        if self.request.user.has_any_role(Role.STAFF):
            return queryset

        return queryset.filter(**{self.owner_field: self.request.user.pk})

# Permissions: every viewset defaults to "any signed-in user reads, staff writes" (core.permissions.RoleWriteOrReadOnly,
# set in settings.REST_FRAMEWORK). The viewsets below that differ say so with write_roles or permission_classes.

# SQL View ViewSets

class ViewUserTrainingsViewSet(viewsets.ModelViewSet):
    queryset = ViewUserTrainings.objects.all().order_by('user_id')
    serializer_class = ViewUserTrainingsSerializer
    pagination_class = StandardResultsSetPagination

class ViewCredentialModelPrerequisitesViewSet(viewsets.ModelViewSet):
    queryset = ViewCredentialModelPrerequisites.objects.all()
    serializer_class = ViewCredentialModelPrerequisitesSerializer
    ordering_fields = ['prerequisite_credential_model_name', 'dependent_credential_model_name']

class ViewCredentialsAdminViewSet(viewsets.ModelViewSet):
    queryset = ViewCredentialsAdmin.objects.all().order_by('recipient_user_id')
    serializer_class = ViewCredentialsAdminSerializer
    pagination_class = StandardResultsSetPagination
    filterset_fields = ['recipient_user_id']
    ordering_fields = ['completion_date', 'credential_model_name', 'credential_status', 'makerspace_name']

class ViewEquipmentDetailPagesViewSet(viewsets.ModelViewSet):
    queryset = ViewEquipmentDetailPages.objects.all()
    serializer_class = ViewEquipmentDetailPagesSerializer
    filterset_fields = ['equipment_id']

class ViewIssueReportCardsViewSet(viewsets.ModelViewSet):
    queryset = ViewIssueReportCards.objects.all().order_by('issue_report_id')
    serializer_class = ViewIssueReportCardsSerializer
    pagination_class = StandardResultsSetPagination

class ViewMakerspaceDetailPagesViewSet(viewsets.ModelViewSet):
    queryset = ViewMakerspaceDetailPages.objects.all()
    serializer_class = ViewMakerspaceDetailPagesSerializer
    filterset_fields = ['makerspace_id']

class CredentialSummaryViewSet(viewsets.ModelViewSet):
    queryset = CredentialSummary.objects.all().order_by('recipient_user_id')
    serializer_class = CredentialSummarySerializer
    pagination_class = StandardResultsSetPagination
    filterset_fields = ['recipient_user_id']
    ordering_fields = ['completion_date', 'expiration_date', 'credential_status']

class ViewEquipmentCardsViewSet(viewsets.ModelViewSet):
    queryset = ViewEquipmentCards.objects.all()
    serializer_class = ViewEquipmentCardsSerializer
    search_fields = ['equipment_model_name', 'building', 'rooms', 'equipment_type', 'capabilities', 'materials']
    ordering_fields = ['equipment_model_name', 'equipment_type']

class ViewMakerspaceCardsViewSet(viewsets.ModelViewSet):
    queryset = ViewMakerspaceCards.objects.all()
    serializer_class = ViewMakerspaceCardsSerializer
    filterset_fields = ['makerspace_id']
    search_fields = ['makerspace_name', 'building', 'rooms', 'description', 'themes']
    ordering_fields = ['makerspace_name', 'building']

class ViewPinnedEquipmentViewSet(viewsets.ModelViewSet):
    queryset = ViewPinnedEquipment.objects.all()
    serializer_class = ViewPinnedEquipmentSerializer
    filterset_fields = ['user_id']

class ViewWishlistedCredentialModelViewSet(viewsets.ModelViewSet):
    queryset = ViewWishlistedCredentialModels.objects.all()
    serializer_class = ViewWishlistedCredentialModelSerializer
    filterset_fields = ['user_id']

# Standard Table ViewSets

class UserViewSet(viewsets.ModelViewSet):
    # Staff-only writes: users edit their own profile through /me/, whose serializer can't change roles.
    queryset = User.objects.all().order_by('user_id')
    serializer_class = UserSerializer
    pagination_class = StandardResultsSetPagination
    filterset_fields = ['uniqname']

class MakerspaceViewSet(viewsets.ModelViewSet):
    queryset = Makerspace.objects.all()
    serializer_class = MakerspaceSerializer
    ordering_fields = ['makerspace_name']

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    filterset_fields = ['makerspace_id', 'equipment_model_id', 'credential_model_id']
    write_roles = [Role.STAFF, Role.SHOP_MANAGER, Role.SHOP_MENTOR]

class EquipmentModelViewSet(viewsets.ModelViewSet):
    queryset = EquipmentModel.objects.all()
    serializer_class = EquipmentModelSerializer
    ordering_fields = ['equipment_model_name']

class CredentialViewSet(OwnRowsUnlessStaffMixin, viewsets.ModelViewSet):
    queryset = Credential.objects.all().order_by('credential_id')
    serializer_class = CredentialSerializer
    pagination_class = StandardResultsSetPagination
    owner_field = 'recipient_user_id'

class CredentialModelViewSet(viewsets.ModelViewSet):
    queryset = CredentialModel.objects.all()
    serializer_class = CredentialModelSerializer
    filterset_class = CredentialModelFilter
    ordering_fields = ['credential_model_name']

class MakerspaceCredentialModelViewSet(CompositeKeyLookupMixin, viewsets.ModelViewSet):
    queryset = MakerspaceCredentialModel.objects.all()
    serializer_class = MakerspaceCredentialModelSerializer
    composite_key_fields = ['makerspace_id', 'credential_model_id']
    filterset_fields = ['makerspace_id', 'credential_model_id']
    ordering_fields = ['created_at', 'last_updated']

class CredentialModelPrerequisiteViewSet(CompositeKeyLookupMixin, viewsets.ModelViewSet):
    queryset = CredentialModelPrerequisite.objects.all()
    serializer_class = CredentialModelPrerequisiteSerializer
    composite_key_fields = ['prerequisite_credential_model_id', 'dependent_credential_model_id']
    filterset_class = CredentialModelPrerequisiteFilter
    ordering_fields = ['created_at', 'last_updated']

class MakerspaceStaffViewSet(CompositeKeyLookupMixin, viewsets.ModelViewSet):
    queryset = MakerspaceStaff.objects.all()
    serializer_class = MakerspaceStaffSerializer
    composite_key_fields = ['makerspace_id', 'user_id']
    filterset_fields = ['makerspace_id', 'user_id']
    ordering_fields = ['makerspace_id', 'user_id']

class CapabilityViewSet(viewsets.ModelViewSet):
    queryset = Capability.objects.all()
    serializer_class = CapabilitySerializer
    ordering_fields = ['name']

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    ordering_fields = ['name']

class EquipmentModelCapabilityViewSet(CompositeKeyLookupMixin, viewsets.ModelViewSet):
    queryset = EquipmentModelCapability.objects.all()
    serializer_class = EquipmentModelCapabilitySerializer
    composite_key_fields = ['equipment_model_id', 'capability_id']
    filterset_fields = ['equipment_model_id', 'capability_id']
    ordering_fields = ['equipment_model_id', 'capability_id']

class EquipmentAcceptedMaterialViewSet(CompositeKeyLookupMixin, viewsets.ModelViewSet):
    queryset = EquipmentAcceptedMaterial.objects.all()
    serializer_class = EquipmentAcceptedMaterialSerializer
    composite_key_fields = ['equipment_id', 'material_id']
    filterset_fields = ['equipment_id', 'material_id']
    ordering_fields = ['equipment_id', 'material_id']

class EquipmentRestrictedMaterialViewSet(CompositeKeyLookupMixin, viewsets.ModelViewSet):
    queryset = EquipmentRestrictedMaterial.objects.all()
    serializer_class = EquipmentRestrictedMaterialSerializer
    composite_key_fields = ['equipment_id', 'material_id']
    filterset_fields = ['equipment_id', 'material_id']
    ordering_fields = ['equipment_id', 'material_id']

class IssueReportViewSet(viewsets.ModelViewSet):
    queryset = IssueReport.objects.all().order_by('issue_report_id')
    serializer_class = IssueReportSerializer
    pagination_class = StandardResultsSetPagination
    filterset_fields = ['reporter_user']
    permission_classes = [IsAuthenticated, IsOwnerOrStaff]
    owner_field = 'reporter_user_id'

class PinnedEquipmentViewSet(CompositeKeyLookupMixin, viewsets.ModelViewSet):
    queryset = PinnedEquipment.objects.all()
    serializer_class = PinnedEquipmentSerializer
    composite_key_fields = ['user_id', 'equipment_id']
    filterset_fields = ['user_id', 'equipment_id']
    ordering_fields = ['created_at', 'last_updated']
    permission_classes = [IsAuthenticated, IsOwnerOrStaff]
    owner_field = 'user_id'

class WishlistedCredentialModelViewSet(CompositeKeyLookupMixin, viewsets.ModelViewSet):
    queryset = WishlistedCredentialModels.objects.all()
    serializer_class = WishlistedCredentialModelSerializer
    composite_key_fields = ['user_id', 'credential_model_id']
    filterset_fields = ['user_id', 'credential_model_id']
    ordering_fields = ['created_at', 'last_updated']
    permission_classes = [IsAuthenticated, IsOwnerOrStaff]
    owner_field = 'user_id'

# Current User

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def me(request):
    """The signed-in user's profile. The frontend loads it on startup and PATCHes it from the complete-profile form."""
    # Makes CsrfViewMiddleware send the csrftoken cookie that api.ts echoes back on writes.
    get_token(request)

    if request.method == 'PATCH':
        serializer = MeSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        # Submitting the complete-profile form is what completes the profile, so the client can't skip it by sending the flag.
        serializer.save(profile_completed=True)
        return Response(serializer.data)

    return Response(MeSerializer(request.user).data)
