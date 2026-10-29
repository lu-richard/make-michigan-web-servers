from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from core import views

router = routers.DefaultRouter()

# SQL Views

router.register(r"view-user-trainings", views.ViewUserTrainingsViewSet)
router.register(r"view-credential-model-prereqs", views.ViewCredentialModelPrerequisitesViewSet)
router.register(r"view-credentials-admin", views.ViewCredentialsAdminViewSet)
router.register(r"view-equipment-detail-pages", views.ViewEquipmentDetailPagesViewSet)
router.register(r"view-issue-report-cards", views.ViewIssueReportCardsViewSet)
router.register(r"view-makerspace-detail-pages", views.ViewMakerspaceDetailPagesViewSet)
router.register(r"view-pinned-equipment", views.ViewPinnedEquipmentViewSet)
router.register(r"view-wishlisted-credential-models", views.ViewWishlistedCredentialModelViewSet)

router.register(r"credential-summary", views.CredentialSummaryViewSet)
router.register(r"view-equipment-cards", views.ViewEquipmentCardsViewSet)
router.register(r"view-makerspace-cards", views.ViewMakerspaceCardsViewSet)

# Standard Tables

router.register(r"profiles", views.UserViewSet)
router.register(r"makerspaces", views.MakerspaceViewSet)
router.register(r"equipment", views.EquipmentViewSet)
router.register(r"equipment-models", views.EquipmentModelViewSet)
router.register(r"credentials", views.CredentialViewSet)
router.register(r"credential-models", views.CredentialModelViewSet)
router.register(r"credential-model-prereqs", views.CredentialModelPrerequisiteViewSet)
router.register(r"makerspace-credential-models", views.MakerspaceCredentialModelViewSet)
router.register(r"makerspace-staff", views.MakerspaceStaffViewSet)
router.register(r"capabilities", views.CapabilityViewSet)
router.register(r"materials", views.MaterialViewSet)
router.register(r"equipment-model-capabilities", views.EquipmentModelCapabilityViewSet)
router.register(r"equipment-accepted-materials", views.EquipmentAcceptedMaterialViewSet)
router.register(r"equipment-restricted-materials", views.EquipmentRestrictedMaterialViewSet)
router.register(r"issue-reports", views.IssueReportViewSet)
router.register(r"pinned-equipment", views.PinnedEquipmentViewSet)
router.register(r"wishlisted-credential-models", views.WishlistedCredentialModelViewSet)

# Detail routes for composite-key tables, nested under the parent that owns the relationship.
# URL kwarg names must match each viewset's composite_key_fields.

composite_detail = {"get": "retrieve", "delete": "destroy"}

nested_urlpatterns = [
    path("profiles/<uuid:user_id>/pinned-equipment/<uuid:equipment_id>/", views.PinnedEquipmentViewSet.as_view(composite_detail)),
    path("profiles/<uuid:user_id>/wishlisted-credential-models/<uuid:credential_model_id>/", views.WishlistedCredentialModelViewSet.as_view(composite_detail)),
    path("makerspaces/<uuid:makerspace_id>/staff/<uuid:user_id>/", views.MakerspaceStaffViewSet.as_view(composite_detail)),
    path("makerspaces/<uuid:makerspace_id>/credential-models/<uuid:credential_model_id>/", views.MakerspaceCredentialModelViewSet.as_view(composite_detail)),
    path("credential-models/<uuid:dependent_credential_model_id>/prerequisites/<uuid:prerequisite_credential_model_id>/", views.CredentialModelPrerequisiteViewSet.as_view(composite_detail)),
    path("equipment-models/<uuid:equipment_model_id>/capabilities/<uuid:capability_id>/", views.EquipmentModelCapabilityViewSet.as_view(composite_detail)),
    path("equipment/<uuid:equipment_id>/accepted-materials/<uuid:material_id>/", views.EquipmentAcceptedMaterialViewSet.as_view(composite_detail)),
    path("equipment/<uuid:equipment_id>/restricted-materials/<uuid:material_id>/", views.EquipmentRestrictedMaterialViewSet.as_view(composite_detail)),
]

urlpatterns = [
    path("api/", include(nested_urlpatterns)),
    path("api/", include(router.urls)),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
]
