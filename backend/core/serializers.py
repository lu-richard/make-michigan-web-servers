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
    class Meta:
        model = Equipment
        fields = '__all__'

class EquipmentModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentModels
        fields = '__all__'

class CredentialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Credentials
        fields = '__all__'

class CredentialModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CredentialModels
        fields = '__all__'

class CredentialModelPrerequisiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CredentialModelPrerequisites
        fields = '__all__'

class MakerspaceCredentialModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MakerspaceCredentialModels
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Posts
        fields = '__all__'

class IssueReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueReports
        fields = '__all__'

class OperationalDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperationalData
        fields = '__all__'

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


