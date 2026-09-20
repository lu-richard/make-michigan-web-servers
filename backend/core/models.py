import uuid

from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.exceptions import ValidationError
from django.db import models

# Enums

class CredentialType(models.TextChoices):
    SAFETY = "safety", "safety"
    EQUIPMENT = "equipment", "equipment"

class CredentialStatus(models.TextChoices):
    ACTIVE_USER = "active_user", "active_user"
    PENDING_USER = "pending_user", "pending_user"
    OPERATOR = "operator", "operator"
    EXPIRED = "expired", "expired"
    INVALIDATED = "invalidated", "invalidated"

class EquipmentStatus(models.TextChoices):
    OPEN = "open", "open"
    CLOSED = "closed", "closed"
    IN_USE = "in_use", "in_use"
    RESERVED = "reserved", "reserved"
    UNDER_MAINTENANCE = "under_maintenance", "under_maintenance"
    OUT_OF_ORDER = "out_of_order", "out_of_order"

class MakerspaceStatus(models.TextChoices):
    OPEN = "open", "open"
    CLOSED = "closed", "closed"
    RESERVED = "reserved", "reserved"
    SOFT_OPEN = "soft_open", "soft_open"

class MakerspaceTheme(models.TextChoices):
    ELECTRONICS = "electronics", "electronics"
    THREE_D_PRINTING = "3d_printing", "3d_printing"
    WOODWORKING = "woodworking", "woodworking"
    COLLABORATIVE = "collaborative", "collaborative"
    MUSIC = "music", "music"
    FIBER_ARTS = "fiber_arts", "fiber_arts"

class MakerspaceTier(models.TextChoices):
    BASIC = "basic", "basic"

class Role(models.TextChoices):
    STUDENT = "student", "student"
    ALUM = "alum", "alum"
    STAFF = "staff", "staff"
    SHOP_MANAGER = "shop_manager", "shop_manager"
    SHOP_MENTOR = "shop_mentor", "shop_mentor"

class SystemTheme(models.TextChoices):
    LIGHT = "light", "light"
    DARK = "dark", "dark"

class Locale(models.TextChoices):
    EN_US = "en_US", "en_US"
    EN_GB = "en_GB", "en_GB"
    ZH_CN = "zh_CN", "zh_CN"
    ES_ES = "es_ES", "es_ES"
    ES_MX = "es_MX", "es_MX"
    ES_LA = "es_LA", "es_LA"
    HI_IN = "hi_IN", "hi_IN"
    AR = "ar", "ar"
    FR_FR = "fr_FR", "fr_FR"
    FR_CA = "fr_CA", "fr_CA"
    DE_DE = "de_DE", "de_DE"
    JA_JP = "ja_JP", "ja_JP"
    PT_BR = "pt_BR", "pt_BR"
    PT_PT = "pt_PT", "pt_PT"
    RU_RU = "ru_RU", "ru_RU"

# Validators

def validate_roles(value):
    if not value:
        return
    invalid = [v for v in value if v not in Role.values]
    if invalid:
        raise ValidationError(f"Invalid role(s): {invalid}")

def validate_themes(value):
    if not value:
        return
    invalid = [v for v in value if v not in MakerspaceTheme.values]
    if invalid:
        raise ValidationError(f"Invalid theme(s): {invalid}")

def validate_phone_length(value):
    if len(value) != 10:
        raise ValidationError("contact_phone must be exactly 10 characters")

# User

class UserManager(BaseUserManager):
    def create_user(self, uniqname, **extra_fields):
        if not uniqname:
            raise ValueError("Users must have a uniqname")
        user = self.model(uniqname=uniqname, **extra_fields)
        user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, uniqname, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(uniqname, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    uniqname = models.CharField(max_length=8, unique=True)
    first_name = models.CharField(max_length=100)
    middle_initial = models.CharField(max_length=1, blank=True, null=True)
    last_name = models.CharField(max_length=100)
    image_url = models.TextField(blank=True, null=True)
    pronouns = models.CharField(max_length=50, blank=True, null=True)
    roles = models.JSONField(default=list, blank=True, validators=[validate_roles])
    created_at = models.DateTimeField(auto_now_add=True)
    system_theme = models.CharField(max_length=10, choices=SystemTheme.choices, default=SystemTheme.LIGHT)
    is_grad_student = models.BooleanField(default=False)
    locale = models.CharField(max_length=10, choices=Locale.choices, default=Locale.EN_US)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "uniqname"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        db_table = "profiles"

# Lookup tables

class CredentialModel(models.Model):
    credential_model_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    credential_model_name = models.CharField(max_length=255)
    credential_type = models.CharField(max_length=20, choices=CredentialType.choices)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "credential_models"

class Capability(models.Model):
    capability_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = "capabilities"

class Material(models.Model):
    material_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = "materials"

# Core entity tables

class Makerspace(models.Model):
    makerspace_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    makerspace_name = models.CharField(max_length=255)
    makerspace_tier = models.CharField(max_length=10, choices=MakerspaceTier.choices, blank=True, null=True)
    makerspace_status = models.CharField(max_length=20, choices=MakerspaceStatus.choices, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    rooms = models.JSONField(blank=True, null=True)
    themes = models.JSONField(blank=True, null=True, validators=[validate_themes])
    audience = models.JSONField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    contact_email = models.CharField(max_length=255)
    contact_phone = models.CharField(max_length=10, validators=[validate_phone_length])
    building = models.CharField(max_length=9)
    cover_image = models.TextField(blank=True, null=True)
    floorplan_image = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "makerspaces"

class EquipmentModel(models.Model):
    equipment_model_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    equipment_model_name = models.CharField(max_length=255)
    make = models.CharField(max_length=255)
    model = models.CharField(max_length=255)
    equipment_type = models.CharField(max_length=100)
    is_cnc = models.BooleanField()
    specs_url = models.TextField(blank=True, null=True)
    specific_specs = models.JSONField(blank=True, null=True)
    manufacturer_image_urls = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "equipment_models"

class Equipment(models.Model):
    equipment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    equipment_name = models.CharField(max_length=255)
    equipment_model = models.ForeignKey(EquipmentModel, on_delete=models.CASCADE)
    makerspace = models.ForeignKey(Makerspace, on_delete=models.CASCADE)
    credential_model = models.ForeignKey(CredentialModel, on_delete=models.SET_NULL, blank=True, null=True)
    equipment_status = models.CharField(max_length=20, choices=EquipmentStatus.choices, blank=True, null=True)
    in_situ_image_url = models.TextField(blank=True, null=True)
    specific_specs = models.JSONField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    last_serviced = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "equipment"

class Credential(models.Model):
    credential_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    credential_model = models.ForeignKey(CredentialModel, on_delete=models.CASCADE)
    issuing_makerspace = models.ForeignKey(Makerspace, on_delete=models.CASCADE)
    author_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="authored_credentials")
    recipient_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_credentials")
    credential_status = models.CharField(max_length=20, choices=CredentialStatus.choices)
    completion_date = models.DateField(blank=True, null=True)
    expiration_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "credentials"

class IssueReport(models.Model):
    issue_report_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    reporter_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name="reported_issues")
    overseer_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name="overseen_issues")
    title = models.CharField(max_length=255, default="a")
    issue_type = models.CharField(max_length=100)
    description = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "issue_reports"

class OperationalData(models.Model):
    equipment = models.OneToOneField(Equipment, on_delete=models.CASCADE, primary_key=True)
    num_lifetime_reports = models.SmallIntegerField(blank=True, null=True)
    lifetime_hours = models.IntegerField(blank=True, null=True)
    monthly_users = models.SmallIntegerField(blank=True, null=True)
    downtime = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "operational_data"

class Post(models.Model):
    post_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    post_image_urls = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True, blank=True, null=True)

    class Meta:
        db_table = "posts"

# Junction tables (composite primary keys)

class CredentialModelPrerequisite(models.Model):
    pk = models.CompositePrimaryKey("prerequisite_credential_model_id", "dependent_credential_model_id")
    prerequisite_credential_model = models.ForeignKey(CredentialModel, on_delete=models.CASCADE, related_name="prerequisite_for_set")
    dependent_credential_model = models.ForeignKey(CredentialModel, on_delete=models.CASCADE, related_name="depends_on_set")
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "credential_model_prerequisites"

class MakerspaceCredentialModel(models.Model):
    pk = models.CompositePrimaryKey("makerspace_id", "credential_model_id")
    makerspace = models.ForeignKey(Makerspace, on_delete=models.CASCADE)
    credential_model = models.ForeignKey(CredentialModel, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "makerspace_credential_models"

class MakerspaceStaff(models.Model):
    pk = models.CompositePrimaryKey("makerspace_id", "user_id")
    makerspace = models.ForeignKey(Makerspace, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        db_table = "makerspace_staff"

class EquipmentModelCapability(models.Model):
    pk = models.CompositePrimaryKey("equipment_model_id", "capability_id")
    equipment_model = models.ForeignKey(EquipmentModel, on_delete=models.CASCADE)
    capability = models.ForeignKey(Capability, on_delete=models.CASCADE)

    class Meta:
        db_table = "equipment_model_capabilities"

class EquipmentAcceptedMaterial(models.Model):
    pk = models.CompositePrimaryKey("equipment_id", "material_id")
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)

    class Meta:
        db_table = "equipment_accepted_materials"

class EquipmentRestrictedMaterial(models.Model):
    pk = models.CompositePrimaryKey("equipment_id", "material_id")
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)

    class Meta:
        db_table = "equipment_restricted_materials"

# SQL Views (created via a RunSQL migration -- see core/migrations/0002_create_views.py)

class ViewUserTrainings(models.Model):
    user_id = models.UUIDField(primary_key=True)
    uniqname = models.CharField(max_length=8)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    completed_trainings = models.JSONField(null=True)

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'user_trainings_view'


class ViewCredentialModelPrerequisites(models.Model):
    pk = models.CompositePrimaryKey('prerequisite_credential_model_name', 'dependent_credential_model_name')
    prerequisite_credential_model_name = models.CharField(max_length=255)
    dependent_credential_model_name = models.CharField(max_length=255)

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'view_credential_model_prerequisites'


class ViewCredentialsAdmin(models.Model):
    pk = models.CompositePrimaryKey('recipient_user_id', 'credential_id')
    recipient_user_id = models.UUIDField()
    credential_id = models.UUIDField()
    completion_date = models.DateField(null=True)
    credential_model_name = models.CharField(max_length=255)
    credential_status = models.CharField(max_length=20, choices=CredentialStatus.choices)
    makerspace_name = models.CharField(max_length=255)

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'view_credentials_admin'


class ViewEquipmentDetailPages(models.Model):
    equipment_id = models.UUIDField(primary_key=True)
    equipment_status = models.CharField(max_length=20, choices=EquipmentStatus.choices, null=True)
    materials = models.JSONField(null=True)
    restricted_materials = models.JSONField(null=True)
    in_situ_image_url = models.TextField(null=True)
    last_serviced = models.DateTimeField(null=True)
    equipment_specific_specs = models.JSONField(null=True)
    notes = models.TextField(null=True)
    equipment_model_name = models.CharField(max_length=255)
    model = models.CharField(max_length=255)
    make = models.CharField(max_length=255)
    equipment_type = models.CharField(max_length=100)
    specs_url = models.TextField(null=True)
    is_cnc = models.BooleanField()
    manufacturer_image_urls = models.JSONField(null=True)
    capabilities = models.JSONField(null=True)
    equipment_model_specific_specs = models.JSONField(null=True)
    makerspace_id = models.UUIDField()
    makerspace_name = models.CharField(max_length=255)
    building = models.CharField(max_length=9)
    rooms = models.JSONField(null=True)
    credential_model_id = models.UUIDField(null=True)
    credential_model_name = models.CharField(max_length=255, null=True)

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'view_equipment_detail_pages'


class ViewIssueReportCards(models.Model):
    issue_report_id = models.UUIDField(primary_key=True)
    issue_type = models.CharField(max_length=100)
    is_resolved = models.BooleanField()
    makerspace_id = models.UUIDField()
    equipment_name = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField()
    reporter_first_name = models.CharField(max_length=100, null=True)
    reporter_last_name = models.CharField(max_length=100, null=True)
    overseer_first_name = models.CharField(max_length=100, null=True)
    overseer_last_name = models.CharField(max_length=100, null=True)

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'view_issue_report_cards'


class ViewMakerspaceDetailPages(models.Model):
    makerspace_id = models.UUIDField(primary_key=True)
    makerspace_name = models.CharField(max_length=255)
    description = models.TextField(null=True)
    makerspace_status = models.CharField(max_length=20, choices=MakerspaceStatus.choices, null=True)
    cover_image = models.TextField(null=True)
    building = models.CharField(max_length=9)
    rooms = models.JSONField(null=True)
    contact_email = models.CharField(max_length=255)
    contact_phone = models.CharField(max_length=10)
    audience = models.JSONField(null=True)
    themes = models.JSONField(null=True)
    floorplan_image = models.TextField(null=True)
    staff_ids = models.JSONField(null=True)
    equipment_list = models.JSONField(default=list)

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'view_makerspace_detail_pages'

# SQL Materialized Views (implemented as regular MySQL views -- MySQL has no materialized
# view feature; created via the same RunSQL migration as the views above)

class CredentialSummary(models.Model):
    pk = models.CompositePrimaryKey('recipient_user_id', 'credential_model_id')
    recipient_user_id = models.UUIDField()
    credential_id = models.UUIDField()
    credential_model_id = models.UUIDField()
    credential_model_name = models.CharField(max_length=255)
    credential_status = models.CharField(max_length=20, choices=CredentialStatus.choices)
    author_first_name = models.CharField(max_length=100, null=True)
    author_last_name = models.CharField(max_length=100, null=True)
    completion_date = models.DateField(null=True)
    expiration_date = models.DateField(null=True)
    makerspace_name = models.CharField(max_length=255, null=True)

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'credential_summary'


class ViewEquipmentCards(models.Model):
    equipment_id = models.UUIDField(primary_key=True)
    equipment_model_name = models.CharField(max_length=255)
    building = models.CharField(max_length=9)
    rooms = models.JSONField(null=True)
    equipment_type = models.CharField(max_length=100)
    capabilities = models.JSONField(null=True)
    manufacturer_image_urls = models.JSONField(null=True)
    materials = models.JSONField(null=True)

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'view_equipment_cards'


class ViewMakerspaceCards(models.Model):
    makerspace_id = models.UUIDField(primary_key=True)
    makerspace_name = models.CharField(max_length=255)
    cover_image = models.TextField(null=True)
    building = models.CharField(max_length=9)
    rooms = models.JSONField(null=True)
    description = models.TextField(null=True)
    themes = models.JSONField(null=True)

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'view_makerspace_cards'
