from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from django_filters import rest_framework as django_filters

from .serializers import *

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

# SQL Materialized View ViewSets

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

# Standard Table ViewSets

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('user_id')
    serializer_class = UserSerializer
    pagination_class = StandardResultsSetPagination
    filterset_fields = ['uniqname']
    # permission_classes = [permissions.isAuthenticated]

class MakerspaceViewSet(viewsets.ModelViewSet):
    queryset = Makerspace.objects.all()
    serializer_class = MakerspaceSerializer

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    filterset_fields = ['credential_model_id']

class EquipmentModelViewSet(viewsets.ModelViewSet):
    queryset = EquipmentModel.objects.all()
    serializer_class = EquipmentModelSerializer

class CredentialViewSet(viewsets.ModelViewSet):
    queryset = Credential.objects.all().order_by('credential_id')
    serializer_class = CredentialSerializer
    pagination_class = StandardResultsSetPagination

class CredentialModelViewSet(viewsets.ModelViewSet):
    queryset = CredentialModel.objects.all()
    serializer_class = CredentialModelSerializer
    filterset_class = CredentialModelFilter

class MakerspaceCredentialModelViewSet(viewsets.ModelViewSet):
    queryset = MakerspaceCredentialModel.objects.all()
    serializer_class = MakerspaceCredentialModelSerializer
    filterset_fields = ['makerspace_id', 'credential_model_id']
    ordering_fields = ['created_at', 'last_updated']

class CredentialModelPrerequisiteViewSet(viewsets.ModelViewSet):
    queryset = CredentialModelPrerequisite.objects.all()
    serializer_class = CredentialModelPrerequisiteSerializer
    filterset_class = CredentialModelPrerequisiteFilter
    ordering_fields = ['created_at', 'last_updated']

class MakerspaceStaffViewSet(viewsets.ModelViewSet):
    queryset = MakerspaceStaff.objects.all()
    serializer_class = MakerspaceStaffSerializer
    filterset_fields = ['makerspace_id', 'user_id']

class CapabilityViewSet(viewsets.ModelViewSet):
    queryset = Capability.objects.all()
    serializer_class = CapabilitySerializer

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

class EquipmentModelCapabilityViewSet(viewsets.ModelViewSet):
    queryset = EquipmentModelCapability.objects.all()
    serializer_class = EquipmentModelCapabilitySerializer
    filterset_fields = ['equipment_model_id', 'capability_id']

class EquipmentAcceptedMaterialViewSet(viewsets.ModelViewSet):
    queryset = EquipmentAcceptedMaterial.objects.all()
    serializer_class = EquipmentAcceptedMaterialSerializer
    filterset_fields = ['equipment_id', 'material_id']

class EquipmentRestrictedMaterialViewSet(viewsets.ModelViewSet):
    queryset = EquipmentRestrictedMaterial.objects.all()
    serializer_class = EquipmentRestrictedMaterialSerializer
    filterset_fields = ['equipment_id', 'material_id']

class IssueReportViewSet(viewsets.ModelViewSet):
    queryset = IssueReport.objects.all().order_by('issue_report_id')
    serializer_class = IssueReportSerializer
    pagination_class = StandardResultsSetPagination
