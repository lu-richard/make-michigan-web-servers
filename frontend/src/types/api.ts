// Hand-written types matching the Django REST API (backend/core/models.py,
// backend/core/serializers.py) -- replaces the old Supabase-CLI-generated
// database.types.ts, which no longer reflects the live schema.

// Enums (backend/core/models.py TextChoices)

export type Role = "student" | "alum" | "staff" | "shop_manager" | "shop_mentor";
export type SystemTheme = "light" | "dark";
export type Locale =
    | "en_US" | "en_GB" | "zh_CN" | "es_ES" | "es_MX" | "es_LA" | "hi_IN" | "ar"
    | "fr_FR" | "fr_CA" | "de_DE" | "ja_JP" | "pt_BR" | "pt_PT" | "ru_RU";
export type CredentialType = "safety" | "equipment";
export type CredentialStatus = "active_user" | "pending_user" | "operator" | "expired" | "invalidated";
export type EquipmentStatus = "open" | "closed" | "in_use" | "reserved" | "under_maintenance" | "out_of_order";
export type MakerspaceStatus = "open" | "closed" | "reserved" | "soft_open";
export type MakerspaceTheme = "electronics" | "3d_printing" | "woodworking" | "collaborative" | "music" | "fiber_arts";
export type MakerspaceTier = "basic";

// Base entities (one per serializer, field-for-field)

export interface User {
    user_id: string;
    uniqname: string;
    first_name: string;
    middle_initial: string | null;
    last_name: string;
    image_url: string | null;
    pronouns: string | null;
    roles: Role[];
    created_at: string;
    system_theme: SystemTheme;
    is_grad_student: boolean;
    locale: Locale;
    is_active: boolean;
    is_staff: boolean;
}

export interface Makerspace {
    makerspace_id: string;
    makerspace_name: string;
    makerspace_tier: MakerspaceTier | null;
    makerspace_status: MakerspaceStatus | null;
    description: string | null;
    rooms: string[] | null;
    themes: MakerspaceTheme[] | null;
    audience: string[] | null;
    latitude: string;
    longitude: string;
    contact_email: string;
    contact_phone: string;
    building: string;
    cover_image: string | null;
    floorplan_image: string | null;
    staff_ids: string[] | null;
    created_at: string;
    last_updated: string;
}

export interface EquipmentModel {
    equipment_model_id: string;
    equipment_model_name: string;
    make: string;
    model: string;
    equipment_type: string;
    is_cnc: boolean;
    specs_url: string | null;
    specific_specs: Record<string, unknown> | null;
    manufacturer_image_urls: string[] | null;
    created_at: string;
    last_updated: string;
}

// Note: no materials/restricted_materials here -- moved to junction tables,
// still available inline via ViewEquipmentCards/ViewEquipmentDetailPages below.
export interface Equipment {
    equipment_id: string;
    equipment_name: string;
    equipment_status: EquipmentStatus | null;
    in_situ_image_url: string | null;
    created_at: string;
    last_serviced: string | null;
    equipment_model_id: string;
    makerspace_id: string;
    last_updated: string;
    credential_model_id: string | null;
    specific_specs: Record<string, unknown> | null;
    notes: string | null;
}

export interface Credential {
    credential_id: string;
    credential_status: CredentialStatus;
    recipient_user_id: string;
    author_user_id: string;
    completion_date: string | null;
    expiration_date: string | null;
    issuing_makerspace_id: string;
    created_at: string;
    last_updated: string;
    credential_model_id: string;
}

export interface CredentialModel {
    credential_model_id: string;
    credential_model_name: string;
    credential_type: CredentialType;
    description: string | null;
    created_at: string;
    last_updated: string;
}

export interface IssueReport {
    issue_report_id: string;
    created_at: string;
    last_updated: string;
    reporter_user_id: string | null;
    issue_type: string;
    description: string;
    is_resolved: boolean;
    equipment_id: string;
    overseer_user_id: string | null;
    title: string;
}

// Lookup / junction entities

export interface Capability {
    capability_id: string;
    name: string;
}

export interface Material {
    material_id: string;
    name: string;
}

export interface MakerspaceStaff {
    makerspace_id: string;
    user_id: string;
}

export interface EquipmentModelCapability {
    equipment_model_id: string;
    capability_id: string;
}

export interface EquipmentAcceptedMaterial {
    equipment_id: string;
    material_id: string;
}

export interface EquipmentRestrictedMaterial {
    equipment_id: string;
    material_id: string;
}

export interface CredentialModelPrerequisite {
    prerequisite_credential_model_id: string;
    dependent_credential_model_id: string;
    created_at: string;
    last_updated: string;
}

export interface MakerspaceCredentialModel {
    makerspace_id: string;
    credential_model_id: string;
    created_at: string;
    last_updated: string;
}

// Views / materialized views (managed=False models backed by MySQL views)

export interface ViewUserTrainings {
    user_id: string;
    uniqname: string;
    first_name: string;
    last_name: string;
    completed_trainings: string[] | null;
}

export interface ViewCredentialModelPrerequisites {
    prerequisite_credential_model_name: string;
    dependent_credential_model_name: string;
}

export interface ViewCredentialsAdmin {
    recipient_user_id: string;
    credential_id: string;
    completion_date: string | null;
    credential_model_name: string;
    credential_status: CredentialStatus;
    makerspace_name: string;
}

export interface ViewEquipmentDetailPages {
    equipment_id: string;
    equipment_status: EquipmentStatus | null;
    materials: string[] | null;
    restricted_materials: string[] | null;
    in_situ_image_url: string | null;
    last_serviced: string | null;
    equipment_specific_specs: Record<string, unknown> | null;
    notes: string | null;
    equipment_model_name: string;
    model: string;
    make: string;
    equipment_type: string;
    specs_url: string | null;
    is_cnc: boolean;
    manufacturer_image_urls: string[] | null;
    capabilities: string[] | null;
    equipment_model_specific_specs: Record<string, unknown> | null;
    makerspace_id: string;
    makerspace_name: string;
    building: string;
    rooms: string[] | null;
    credential_model_id: string | null;
    credential_model_name: string | null;
}

export interface ViewIssueReportCards {
    issue_report_id: string;
    issue_type: string;
    is_resolved: boolean;
    makerspace_id: string;
    equipment_name: string;
    title: string;
    description: string;
    created_at: string;
    reporter_first_name: string | null;
    reporter_last_name: string | null;
    overseer_first_name: string | null;
    overseer_last_name: string | null;
}

export interface MakerspaceEquipmentListItem {
    equipment_id: string;
    equipment_name: string;
}

export interface ViewMakerspaceDetailPages {
    makerspace_id: string;
    makerspace_name: string;
    description: string | null;
    makerspace_status: MakerspaceStatus | null;
    cover_image: string | null;
    building: string;
    rooms: string[] | null;
    contact_email: string;
    contact_phone: string;
    audience: string[] | null;
    themes: MakerspaceTheme[] | null;
    floorplan_image: string | null;
    staff_ids: string[] | null;
    equipment_list: MakerspaceEquipmentListItem[];
}

export interface CredentialSummary {
    recipient_user_id: string;
    credential_id: string;
    credential_model_id: string;
    credential_model_name: string;
    credential_status: CredentialStatus;
    author_first_name: string | null;
    author_last_name: string | null;
    completion_date: string | null;
    expiration_date: string | null;
    makerspace_name: string | null;
}

export interface ViewEquipmentCards {
    equipment_id: string;
    equipment_model_name: string;
    building: string;
    rooms: string[] | null;
    equipment_type: string;
    capabilities: string[] | null;
    manufacturer_image_urls: string[] | null;
    materials: string[] | null;
}

export interface ViewMakerspaceCards {
    makerspace_id: string;
    makerspace_name: string;
    cover_image: string | null;
    building: string;
    rooms: string[] | null;
    description: string | null;
    themes: MakerspaceTheme[] | null;
}

// DRF LimitOffsetPagination envelope

export interface Paginated<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
