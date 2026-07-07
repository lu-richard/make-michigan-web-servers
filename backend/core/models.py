# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from django.contrib.postgres.fields import ArrayField

# Enums

from django.db import models

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

# Standard Tables

class CredentialModelPrerequisites(models.Model):
    pk = models.CompositePrimaryKey('prerequisite_credential_model_id', 'dependent_credential_model_id')
    prerequisite_credential_model = models.ForeignKey('CredentialModels', models.DO_NOTHING, db_comment='ID foreign key of the credential model that is a prerequisite. Part of composite primary key')
    dependent_credential_model = models.ForeignKey('CredentialModels', models.DO_NOTHING, related_name='credentialmodelprerequisites_dependent_credential_model_set', db_comment='ID foreign key of the credential model that has a prerequisite. Part of composite primary key')
    created_at = models.DateTimeField()
    last_updated = models.DateTimeField(db_comment='Timestamp at which this credential model prerequisites row was last updated')

    class Meta:
        managed = False
        db_table = 'credential_model_prerequisites'
        db_table_comment = 'Junction table for storing prerequisite relationships between credential models'


class CredentialModels(models.Model):
    credential_model_id = models.UUIDField(primary_key=True, db_comment='ID primary key of the credential model')
    credential_model_name = models.TextField(db_comment='Official name of the credential model')
    credential_type = models.TextField(choices=CredentialType.choices, db_comment='Primary focus of the credential model (e.g. safety, equipment use validation)')
    description = models.TextField(blank=True, null=True, db_comment='Optional description of the credential model, including core skills developed and required assignments')
    created_at = models.DateTimeField(db_comment='Timestamp at which this credential model row was created')
    last_updated = models.DateTimeField(db_comment='Timestamp at which this credential model row was last updated')

    class Meta:
        managed = False
        db_table = 'credential_models'


class Credentials(models.Model):
    credential_id = models.UUIDField(primary_key=True, db_comment='ID primary key of the credential instance')
    credential_status = models.TextField(choices=CredentialStatus.choices, db_comment='Current status of the credential instance (e.g. active, pending, expired)')
    recipient_user = models.ForeignKey('Profiles', models.DO_NOTHING, db_comment='ID foreign key of the user who received or is to receive this credential from an author user')
    author_user = models.ForeignKey('Profiles', models.DO_NOTHING, related_name='credentials_author_user_set', db_comment='ID foreign key of the user who authored this credential for a recipient user')
    completion_date = models.DateField(blank=True, null=True, db_comment='Date at which the recipient user officially completed this credential')
    expiration_date = models.DateField(blank=True, null=True, db_comment='Date at which this credential expires, if applicable')
    issuing_makerspace = models.ForeignKey('Makerspaces', models.DO_NOTHING, db_comment='ID foreign key of the makerspace that issued this credential. This is not the ID of the only makerspace that this credential is valid for')
    created_at = models.DateTimeField()
    last_updated = models.DateTimeField()
    credential_model = models.ForeignKey(CredentialModels, models.DO_NOTHING, db_comment='ID foreign key of the credential model that this credential belongs to')

    class Meta:
        managed = False
        db_table = 'credentials'


class Equipment(models.Model):
    equipment_id = models.UUIDField(primary_key=True, db_comment='ID primary key of the equipment instance')
    equipment_name = models.TextField(db_comment='Name of the equipment instance. Can either be the official model name or the in-house nickname')
    equipment_status = models.TextField(choices=EquipmentStatus.choices, db_comment='Current status of the equipment instance (e.g. open, in_use, closed)')
    materials = ArrayField(models.TextField(db_comment='List of this equipmentÆs accepted materials'), blank=True, null=True)
    restricted_materials = ArrayField(models.TextField(db_comment='List of this equipmentÆs restricted materials, if known'), blank=True, null=True)
    in_situ_image_url = models.TextField(blank=True, null=True, db_comment='In-situ image of this equipment within its makerspace')
    created_at = models.DateTimeField()
    last_serviced = models.DateTimeField(blank=True, null=True, db_comment='Timestamp at which this equipment was last serviced')
    equipment_model = models.ForeignKey('EquipmentModels', models.DO_NOTHING, db_comment='ID foreign key of the equipment model that this equipment belongs to')
    makerspace = models.ForeignKey('Makerspaces', models.DO_NOTHING, db_comment='ID foreign key of the makerspace that this equipment belongs to')
    last_updated = models.DateTimeField(db_comment='Timestamp at which this equipment row was last updated')
    credential_model = models.ForeignKey(CredentialModels, models.DO_NOTHING, blank=True, null=True, db_comment='ID foreign key of the credential model that unlocks this equipment instance')
    specific_specs = models.JSONField(blank=True, null=True, db_comment='JSONB of the attributes specific to this instance of equipment')
    notes = models.TextField(blank=True, null=True, db_comment='Optional notes accompanying this equipment instance')

    class Meta:
        managed = False
        db_table = 'equipment'
        db_table_comment = 'Table for storing instances of equipment'


class EquipmentModels(models.Model):
    equipment_model_id = models.UUIDField(primary_key=True, db_comment='ID primary key of the equipment model')
    model = models.TextField(db_comment='Name of the model')
    make = models.TextField(db_comment='Name of the make')
    equipment_type = models.TextField(db_comment='Category of equipment that this equipment model falls into (e.g. 3D printer, bandsaw)')
    specs_url = models.TextField(blank=True, null=True, db_comment='Optional URL to this equipment modelÆs technical specifications')
    is_cnc = models.BooleanField(db_comment='Flag indicating whether this equipment model is CNC')
    manufacturer_image_urls = ArrayField(models.TextField(db_comment='Optional list of manufacturer images of this equipment model'), blank=True, null=True)
    capabilities = ArrayField(models.TextField(db_comment='List of this equipment modelÆs capabilities (e.g. drill, sew, sand)'), blank=True, null=True)
    equipment_model_name = models.TextField(db_comment='Official name of the equipment model')
    created_at = models.DateTimeField(db_comment='Timestamp at which this equipment model row was created')
    last_updated = models.DateTimeField(db_comment='Timestamp at which this equipment model row was last updated')
    specific_specs = models.JSONField(blank=True, null=True, db_comment='JSONB for storing the attributes of this model which are exclusive to its type')

    class Meta:
        managed = False
        db_table = 'equipment_models'


class IssueReports(models.Model):
    issue_report_id = models.UUIDField(primary_key=True, db_comment='ID primary key of the issue report')
    created_at = models.DateTimeField(db_comment='Timestamp at which this report was made')
    last_updated = models.DateTimeField()
    reporter_user = models.ForeignKey('Profiles', models.DO_NOTHING, blank=True, null=True, db_comment='ID foreign key of the user who made the report')
    issue_type = models.TextField(db_comment='Category of the issue (e.g. workspace cleanliness, broken)')
    description = models.TextField(db_comment='Description of the issue')
    is_resolved = models.BooleanField(db_comment='Flag indicating whether this report has been resolved by staff yet')
    equipment = models.ForeignKey(Equipment, models.DO_NOTHING, db_comment='ID foreign key of the equipment instance that was reported')
    overseer_user = models.ForeignKey('Profiles', models.DO_NOTHING, related_name='issuereports_overseer_user_set', blank=True, null=True, db_comment='ID foreign key of the staff member who is overseeing this report')
    title = models.TextField(db_comment='Title of the issue')

    class Meta:
        managed = False
        db_table = 'issue_reports'
        db_table_comment = 'This table is for storing user reports of issues with equipment'


class MakerspaceCredentialModels(models.Model):
    pk = models.CompositePrimaryKey('makerspace_id', 'credential_model_id')
    makerspace = models.ForeignKey('Makerspaces', models.DO_NOTHING, db_comment='ID foreign key of the makerspace that offers the credential model. Part of composite primary key')
    credential_model = models.ForeignKey(CredentialModels, models.DO_NOTHING, db_comment='ID foreign key of the credential model that is offered by the makerspace. Part of composite primary key')
    created_at = models.DateTimeField()
    last_updated = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'makerspace_credential_models'
        db_table_comment = 'Junction table for storing many-to-many relationship between makerspaces and credential models'


class Makerspaces(models.Model):
    makerspace_id = models.UUIDField(primary_key=True, db_comment='ID primary key of the makerspace')
    makerspace_name = models.TextField(db_comment='Name of the makerspace')
    description = models.TextField(blank=True, null=True, db_comment='Optional description of this makerspace')
    makerspace_status = models.TextField(choices=MakerspaceStatus.choices, db_comment='Current status of this makerspace (e.g. open, reserved, closed)')
    latitude = models.FloatField(db_comment='Latitude of the building holding the makerspace (up to 7 decimal places of precision)')
    longitude = models.FloatField(db_comment='Longitude of the building holding the makerspace (upto 7 decimal points of presicion')
    cover_image = models.TextField(blank=True, null=True, db_comment='A link to the image of the makerspace')
    building = models.TextField(db_comment='Acronym or abbreviation for the building holding the makerspace (as defined in the acronym decoder [https://campusinfo.umich.edu/acronyms])')
    rooms = ArrayField(models.TextField(db_comment='Room number ONLY of the makerspace (if there is more than one, choose one)'), blank=True, null=True)
    contact_email = models.TextField(db_comment='Public facing contact email to be displayed alongside makerspace')
    contact_phone = models.TextField(db_comment='Public facing phone number for contacting the makerspace')
    audience = ArrayField(models.TextField(db_comment='A multiselect objects of different types of people that can use these makerspaces'), blank=True, null=True)
    themes = ArrayField(models.TextField(choices=MakerspaceTheme.choices, db_comment="Collection of tags, each indicating one of the makerspace's specializations"), blank=True, null=True)
    created_at = models.DateTimeField(db_comment='Timestamp at which this makerspace row was created')
    last_updated = models.DateTimeField(db_comment='Timestamp at which this makerspace row was last updated')
    makerspace_tier = models.TextField(choices=MakerspaceTier.choices, db_comment="Tier measuring the extent to which this makerspace will participate in M3's features")
    floorplan_image = models.TextField(blank=True, null=True, db_comment="Image of the facility's floor plan, detailing the locations of individual equipment and stations")
    staff_ids = ArrayField(models.TextField(db_comment='UUIDs of profiles of staff members of the facility.'), blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'makerspaces'


class OperationalData(models.Model):
    equipment = models.OneToOneField(Equipment, models.DO_NOTHING, primary_key=True, db_comment='ID foreign key of the equipment instance that this operational data row belongs to. Primary key')
    created_at = models.DateTimeField()
    last_updated = models.DateTimeField()
    lifetime_hours = models.IntegerField(blank=True, null=True, db_comment='Number of hours this equipment instance has operated for throughout its lifetime')
    monthly_users = models.SmallIntegerField(blank=True, null=True, db_comment='Number of monthly users of this equipment instance')
    downtime = models.FloatField(blank=True, null=True, db_comment='Downtime percentage of this equipment instance')
    num_lifetime_reports = models.SmallIntegerField(blank=True, null=True, db_comment='Number of reports that have been assigned to this equipment throughout its lifetime')

    class Meta:
        managed = False
        db_table = 'operational_data'
        db_table_comment = 'Table for storing equipment operational data'


class Posts(models.Model):
    post_id = models.UUIDField(primary_key=True)
    created_at = models.DateTimeField()
    last_updated = models.DateTimeField(blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    title = models.TextField(blank=True, null=True)
    post_image_urls = ArrayField(models.TextField(), blank=True, null=True)
    user = models.ForeignKey('Profiles', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'posts'
        db_table_comment = 'Table for storing user-generated blog posts'


class Profiles(models.Model):
    user_id = models.UUIDField(primary_key=True, db_comment='ID primary key of the user')
    uniqname = models.TextField(unique=True, db_comment='Uniqname of the user')
    first_name = models.TextField(db_comment='First name of the user')
    middle_initial = models.TextField(blank=True, null=True, db_comment='Optional middle initial of the user')
    last_name = models.TextField(db_comment='Last name of the user')
    image_url = models.TextField(blank=True, null=True, db_comment='URL to the userÆs profile picture')
    pronouns = models.TextField(blank=True, null=True, db_comment='Optional pronouns of the user')
    roles = ArrayField(models.TextField(choices=Role.choices, db_comment='List of the userÆs roles (e.g. student, shop mentor, shop manager, staff)'))
    created_at = models.DateTimeField()
    last_signed_in = models.DateTimeField()
    system_theme = models.TextField(choices=SystemTheme.choices, db_comment='UI theme preference of the user')
    is_grad_student = models.BooleanField(db_comment='Flag indicating whether the user is a graduate student')
    locale = models.TextField(choices=Locale.choices, db_comment='Locale preference of the user')

    class Meta:
        managed = False
        db_table = 'profiles'

# SQL Views

class ViewUserTrainings(models.Model):
    user_id = models.UUIDField(primary_key=True)
    uniqname = models.TextField()
    first_name = models.TextField()
    last_name = models.TextField()
    completed_trainings = ArrayField(models.TextField(), null=True)

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'user_trainings_view'


class ViewCredentialModelPrerequisites(models.Model):
    pk = models.CompositePrimaryKey('prerequisite_credential_model_name', 'dependent_credential_model_name')
    prerequisite_credential_model_name = models.TextField()
    dependent_credential_model_name = models.TextField()

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'view_credential_model_prerequisites'


class ViewCredentialsAdmin(models.Model):
    pk = models.CompositePrimaryKey('recipient_user_id', 'credential_id')
    recipient_user_id = models.UUIDField()
    credential_id = models.UUIDField()
    completion_date = models.DateField()
    credential_model_name = models.TextField()
    credential_status = models.TextField(choices=CredentialStatus.choices)
    makerspace_name = models.TextField()

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'view_credentials_admin'


class ViewEquipmentDetailPages(models.Model):
    equipment_id = models.UUIDField(primary_key=True)
    equipment_status = models.TextField(choices=EquipmentStatus.choices)
    materials = ArrayField(models.TextField(), null=True)
    restricted_materials = ArrayField(models.TextField(), null=True)
    in_situ_image_url = models.TextField(null=True)
    last_serviced = models.DateTimeField(null=True)
    equipment_specific_specs = models.JSONField(null=True)
    notes = models.TextField(null=True)
    equipment_model_name = models.TextField()
    model = models.TextField()
    make = models.TextField()
    equipment_type = models.TextField()
    specs_url = models.TextField(null=True)
    is_cnc = models.BooleanField()
    manufacturer_image_urls = ArrayField(models.TextField(), null=True)
    capabilities = ArrayField(models.TextField(), null=True)
    equipment_model_specific_specs = models.JSONField(null=True)
    makerspace_id = models.UUIDField()
    makerspace_name = models.TextField()
    building = models.TextField()
    rooms = ArrayField(models.TextField(), null=True)
    credential_model_id = models.UUIDField()
    credential_model_name = models.TextField()

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'view_equipment_detail_pages'


class ViewIssueReportCards(models.Model):
    issue_report_id = models.UUIDField(primary_key=True)
    issue_type = models.TextField()
    is_resolved = models.BooleanField()
    makerspace_id = models.UUIDField()
    equipment_name = models.TextField()
    title = models.TextField()
    description = models.TextField()
    created_at = models.DateField()
    reporter_first_name = models.TextField()
    reporter_last_name = models.TextField()
    overseer_first_name = models.TextField()
    overseer_last_name = models.TextField()

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'view_issue_report_cards'


class ViewMakerspaceDetailPages(models.Model):
    makerspace_id = models.UUIDField(primary_key=True)
    makerspace_name = models.TextField()
    description = models.TextField()
    makerspace_status = models.TextField(choices=MakerspaceStatus.choices)
    cover_image = models.TextField(null=True)
    building = models.TextField()
    rooms = ArrayField(models.TextField(), null=True)
    contact_email = models.TextField()
    contact_phone = models.TextField()
    audience = ArrayField(models.TextField(), null=True)
    themes = ArrayField(models.TextField(choices=MakerspaceTheme.choices), null=True)
    floorplan_image = models.TextField(null=True)
    staff_ids = ArrayField(models.TextField(), null=True)
    equipment_list = ArrayField(models.JSONField(), default=list)

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'view_makerspace_detail_pages'

# SQL Materialized Views

class CredentialSummary(models.Model):
    pk = models.CompositePrimaryKey('recipient_user_id', 'credential_model_id')
    recipient_user_id = models.UUIDField()
    credential_id = models.UUIDField()
    credential_model_id = models.UUIDField()
    credential_model_name = models.TextField()
    credential_status = models.TextField(choices=CredentialStatus.choices)
    author_first_name = models.TextField()
    author_last_name = models.TextField()
    completion_date = models.DateField()
    expiration_date = models.DateField()
    makerspace_name = models.TextField()

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'private"."credential_summary'


class ViewEquipmentCards(models.Model):
    equipment_id = models.UUIDField(primary_key=True)
    equipment_model_name = models.TextField()
    building = models.TextField()
    rooms = ArrayField(models.TextField(), null=True)
    equipment_type = models.TextField()
    capabilities = ArrayField(models.TextField(), null=True)
    manufacturer_image_urls = ArrayField(models.TextField(), null=True)
    materials = ArrayField(models.TextField(), null=True)
    fts = models.TextField()

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'private"."view_equipment_cards'


class ViewMakerspaceCards(models.Model):
    makerspace_id = models.UUIDField(primary_key=True)
    makerspace_name = models.TextField()
    cover_image = models.TextField()
    building = models.TextField()
    rooms = ArrayField(models.TextField(), null=True)
    description = models.TextField()
    themes = ArrayField(models.TextField(choices=MakerspaceTheme.choices), null=True)
    fts = models.TextField()

    class Meta:
        managed = False  # Created from a view. Don't remove.
        db_table = 'private"."view_makerspace_cards'

