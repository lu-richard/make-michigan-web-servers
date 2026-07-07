import type { Tables, Database } from "../../database.types";

// Card Data Types
export type MakerspaceCardData = Omit<Tables<{ schema: 'private' }, 'view_makerspace_cards'>, 'themes'> & {
    themes: string[] | null;
};
export type CertificateData = Tables<{ schema: 'private' }, 'credential_summary'>;
export type EquipmentCardData = Tables<{ schema: 'private' }, 'view_equipment_cards'>;
export type IssueReportCardData = Tables<'view_issue_report_cards'>;


// Student Dashboard Data Types
export type AdminCredential = Tables<'view_credentials_admin'>;
export type CredentialModel = Tables<'credential_models'>;
export interface EquipmentLink {
    equipment_id: string;
    equipment_name: string;
}
export type TrainingPrerequisites = Tables<'credential_model_prerequisites'>
export type MakerspaceCreds = Tables<'makerspace_credential_models'>;
export interface SkillTreeContext {
    selectedMakerspace: MakerspaceCardData | null
    setSelectedMakerspace: React.Dispatch<React.SetStateAction<MakerspaceCardData | null>>
    credsError: string | null
    credentialModels: CredentialModelLink[] | null
    prereqMap: Record<string, { prerequisite_ids: string[]; prerequisite_models: CredentialModelLink[] }> | null
    completedModelIds: Set<string>
    credsLoading: boolean
}


// Detail Page Data Types
interface MakerspaceEquipment {
    equipment_id: string;
    equipment_name: string;
}
export type MakerspaceDetailData = Omit<Tables<'view_makerspace_detail_pages'>, 'equipment_list' | 'themes'> & {
    equipment_list: MakerspaceEquipment[] | null;
    themes: string[] | null;
};
export type EquipmentDetailData = Tables<'view_equipment_detail_pages'>;
export interface CredentialModelLink {
  credential_model_id: string
  credential_model_name: string
}


// App Types
export interface ProfileData {
    user_id: string;
    uniqname: string;
    first_name: string;
    middle_initial?: string | null;
    last_name: string;
    image_url?: string | null;
    pronouns?: string | null;
    roles: Database["public"]["Enums"]["role"][] | null;
    system_theme?: Database["public"]["Enums"]["system_theme"];
    is_grad_student?: boolean;
    locale?: Database["public"]["Enums"]["locale"];
}
export interface AppContextType {
    profile: ProfileData | null;
    setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>> | null;
    loading: boolean;
}

// URL Params Types
export interface CredentialModelDetailParams {

}