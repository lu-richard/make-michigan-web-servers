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

# SQL Materialized Views

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

urlpatterns = [
    path("api/", include(router.urls)),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
]
