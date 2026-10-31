from rest_framework import serializers
from core.models import *

# Standard Table Serializers

class UserSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField()

    class Meta:
        model = User
        fields = ['user_id', 'uniqname', 'first_name', 'middle_initial', 'last_name', 'image_url', 'pronouns', 'roles', 'created_at', 'system_theme', 'locale', 'is_active', 'profile_completed']

class MeSerializer(UserSerializer):
    """The signed-in user's own profile. Personal details and roles are editable; identity and account flags are not.
    Note: any role can be self-assigned here, including the ones that grant write access (see core.permissions)."""
    user_id = serializers.UUIDField(read_only=True)

    class Meta(UserSerializer.Meta):
        read_only_fields = ['uniqname', 'created_at', 'is_active', 'profile_completed']

    def validate_roles(self, value):
        # Without this, a JSON-encoded string gets checked character by character by the model's role validator.
        if not isinstance(value, list):
            raise serializers.ValidationError("Expected a list of roles.")

        return value

class MakerspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Makerspace
        fields = '__all__'

class EquipmentSerializer(serializers.ModelSerializer):
    equipment_model_id = serializers.UUIDField()
    makerspace_id = serializers.UUIDField()
    credential_model_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = Equipment
        fields = ['equipment_id', 'equipment_name', 'equipment_status', 'in_situ_image_url', 'created_at', 'last_serviced', 'equipment_model_id', 'makerspace_id', 'last_updated', 'credential_model_id', 'specific_specs', 'notes']

class EquipmentModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentModel
        fields = '__all__'

class CredentialSerializer(serializers.ModelSerializer):
    recipient_user_id = serializers.UUIDField()
    author_user_id = serializers.UUIDField()
    issuing_makerspace_id = serializers.UUIDField()
    credential_model_id = serializers.UUIDField()

    class Meta:
        model = Credential
        fields = ['credential_id', 'credential_status', 'recipient_user_id', 'author_user_id', 'completion_date', 'expiration_date', 'issuing_makerspace_id', 'created_at', 'last_updated', 'credential_model_id']

class CredentialModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CredentialModel
        fields = '__all__'

class CredentialModelPrerequisiteSerializer(serializers.ModelSerializer):
    prerequisite_credential_model_id = serializers.UUIDField()
    dependent_credential_model_id = serializers.UUIDField()

    class Meta:
        model = CredentialModelPrerequisite
        fields = ['prerequisite_credential_model_id', 'dependent_credential_model_id', 'created_at', 'last_updated']

class MakerspaceCredentialModelSerializer(serializers.ModelSerializer):
    makerspace_id = serializers.UUIDField()
    credential_model_id = serializers.UUIDField()

    class Meta:
        model = MakerspaceCredentialModel
        fields = ['makerspace_id', 'credential_model_id', 'created_at', 'last_updated']

class MakerspaceStaffSerializer(serializers.ModelSerializer):
    makerspace_id = serializers.UUIDField()
    user_id = serializers.UUIDField()

    class Meta:
        model = MakerspaceStaff
        fields = ['makerspace_id', 'user_id']

class CapabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Capability
        fields = '__all__'

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class EquipmentModelCapabilitySerializer(serializers.ModelSerializer):
    equipment_model_id = serializers.UUIDField()
    capability_id = serializers.UUIDField()

    class Meta:
        model = EquipmentModelCapability
        fields = ['equipment_model_id', 'capability_id']

class EquipmentAcceptedMaterialSerializer(serializers.ModelSerializer):
    equipment_id = serializers.UUIDField()
    material_id = serializers.UUIDField()

    class Meta:
        model = EquipmentAcceptedMaterial
        fields = ['equipment_id', 'material_id']

class EquipmentRestrictedMaterialSerializer(serializers.ModelSerializer):
    equipment_id = serializers.UUIDField()
    material_id = serializers.UUIDField()

    class Meta:
        model = EquipmentRestrictedMaterial
        fields = ['equipment_id', 'material_id']

class IssueReportSerializer(serializers.ModelSerializer):
    reporter_user_id = serializers.UUIDField(required=False, allow_null=True)
    equipment_id = serializers.UUIDField()
    overseer_user_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = IssueReport
        fields = ['issue_report_id', 'created_at', 'last_updated', 'reporter_user_id', 'issue_type', 'description', 'is_resolved', 'equipment_id', 'overseer_user_id', 'title']

class PinnedEquipmentSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField()
    equipment_id = serializers.UUIDField()

    class Meta:
        model = PinnedEquipment
        fields = ['user_id', 'equipment_id', 'created_at', 'last_updated']

class WishlistedCredentialModelSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField()
    credential_model_id = serializers.UUIDField()
    makerspace_id = serializers.UUIDField()
    
    class Meta:
        model = WishlistedCredentialModels
        fields = ['user_id', 'credential_model_id', 'makerspace_id', 'created_at', 'last_updated']

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
    class Meta:
        model = ViewMakerspaceDetailPages
        fields = '__all__'

class CredentialSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = CredentialSummary
        fields = '__all__'

class ViewEquipmentCardsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewEquipmentCards
        fields = '__all__'

class ViewMakerspaceCardsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewMakerspaceCards
        fields = '__all__'

class ViewPinnedEquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewPinnedEquipment
        fields = '__all__'

class ViewWishlistedCredentialModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewWishlistedCredentialModels
        fields = '__all__'