from rest_framework import serializers
from core.models import *

# Standard Table Serializers

class ProfileSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = Profiles
        fields = '__all__'
    
    def get_roles(self, obj):
        if not obj.roles:
            return []
        
        cleaned = obj.roles.strip('{}')
        if not cleaned:
            return []

        return [role.strip() for role in cleaned.split(',')]

class MakerspaceSerializer(serializers.ModelSerializer):
    themes = serializers.SerializerMethodField()

    class Meta:
        model = Makerspaces
        fields = '__all__'
    
    def get_themes(self, obj):
        if not obj.themes:
            return []
        
        cleaned = obj.themes.strip('{}')
        if not cleaned:
            return []

        return [theme.strip() for theme in cleaned.split(',')]

class EquipmentSerializer(serializers.ModelSerializer):
    equipment_model_id = serializers.UUIDField()
    makerspace_id = serializers.UUIDField()
    credential_model_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = Equipment
        fields = ['equipment_id', 'equipment_name', 'equipment_status', 'materials', 'restricted_materials', 'in_situ_image_url', 'created_at', 'last_serviced', 'equipment_model_id', 'makerspace_id', 'last_updated', 'credential_model_id', 'specific_specs', 'notes']

class EquipmentModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentModels
        fields = '__all__'

class CredentialSerializer(serializers.ModelSerializer):
    recipient_user_id = serializers.UUIDField()
    author_user_id = serializers.UUIDField()
    issuing_makerspace_id = serializers.UUIDField()
    credential_model_id = serializers.UUIDField()

    class Meta:
        model = Credentials
        fields = ['credential_id', 'credential_status', 'recipient_user_id', 'author_user_id', 'completion_date', 'expiration_date', 'issuing_makerspace_id', 'created_at', 'last_updated', 'credential_model_id']

class CredentialModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CredentialModels
        fields = '__all__'

class CredentialModelPrerequisiteSerializer(serializers.ModelSerializer):
    prerequisite_credential_model_id = serializers.UUIDField()
    dependent_credential_model_id = serializers.UUIDField()

    class Meta:
        model = CredentialModelPrerequisites
        fields = ['prerequisite_credential_model_id', 'dependent_credential_model_id', 'created_at', 'last_updated']

class MakerspaceCredentialModelSerializer(serializers.ModelSerializer):
    makerspace_id = serializers.UUIDField()
    credential_model_id = serializers.UUIDField()

    class Meta:
        model = MakerspaceCredentialModels
        fields = ['makerspace_id', 'credential_model_id', 'created_at', 'last_updated']

class PostSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField()

    class Meta:
        model = Posts
        fields = ['post_id', 'created_at', 'last_updated', 'content', 'title', 'post_image_urls', 'user_id']

class IssueReportSerializer(serializers.ModelSerializer):
    reporter_user_id = serializers.UUIDField(required=False, allow_null=True)
    equipment_id = serializers.UUIDField()
    overseer_user_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = IssueReports
        fields = ['issue_report_id', 'created_at', 'last_updated', 'reporter_user_id', 'issue_type', 'description', 'is_resolved', 'equipment_id', 'overseer_user_id', 'title']

class OperationalDataSerializer(serializers.ModelSerializer):
    equipment_id = serializers.UUIDField()

    class Meta:
        model = OperationalData
        fields = ['equipment_id', 'created_at', 'last_updated', 'lifetime_hours', 'monthly_users', 'downtime', 'num_lifetime_reports']

# SQL View Serializers

class ViewUserTrainingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewUserTrainings
        fields = '__all__'

class ViewCredentialModelPrerequisitesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewCredentialModelPrerequisites
        fields = '__all__'

class ViewCredentialsAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewCredentialsAdmin
        fields = '__all__'

class ViewEquipmentDetailPagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewEquipmentDetailPages
        fields = '__all__'


class ViewIssueReportCardsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewIssueReportCards
        fields = '__all__'

class ViewMakerspaceDetailPagesSerializer(serializers.ModelSerializer):
    themes = serializers.SerializerMethodField()

    class Meta:
        model = ViewMakerspaceDetailPages
        fields = '__all__'

    def get_themes(self, obj):
        if not obj.themes:
            return []

        cleaned = obj.themes.strip('{}')
        if not cleaned:
            return []

        return [theme.strip() for theme in cleaned.split(',')]

# SQL Materialized View Serializers

class CredentialSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = CredentialSummary
        fields = '__all__'

class ViewEquipmentCardsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewEquipmentCards
        fields = '__all__'

class ViewMakerspaceCardsSerializer(serializers.ModelSerializer):
    themes = serializers.SerializerMethodField()

    class Meta:
        model = ViewMakerspaceCards
        fields = '__all__'
    
    def get_themes(self, obj):
        if not obj.themes:
            return []
        
        cleaned = obj.themes.strip('{}')
        if not cleaned:
            return []

        return [theme.strip() for theme in cleaned.split(',')]


