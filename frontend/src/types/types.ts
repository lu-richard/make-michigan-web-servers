import type {
    User,
    ViewMakerspaceCards,
    ViewEquipmentCards,
    CredentialSummary,
    ViewIssueReportCards,
    ViewCredentialsAdmin,
    CredentialModel as ApiCredentialModel,
    CredentialModelPrerequisite,
    MakerspaceCredentialModel,
    ViewMakerspaceDetailPages,
    ViewEquipmentDetailPages,
} from "./api";

// Card Data Types
export type MakerspaceCardData = ViewMakerspaceCards;
export type CertificateData = CredentialSummary;
export type EquipmentCardData = ViewEquipmentCards;
export type IssueReportCardData = ViewIssueReportCards;


// Student Dashboard Data Types
export type AdminCredential = ViewCredentialsAdmin;
export type CredentialModel = ApiCredentialModel;
export interface EquipmentLink {
    equipment_id: string;
    equipment_name: string;
}
export type TrainingPrerequisites = CredentialModelPrerequisite;
export type MakerspaceCreds = MakerspaceCredentialModel;
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
export type MakerspaceDetailData = ViewMakerspaceDetailPages;
export type EquipmentDetailData = ViewEquipmentDetailPages;
export interface CredentialModelLink {
  credential_model_id: string
  credential_model_name: string
}


// App Types
export type ProfileData = User;
export interface AppContextType {
    profile: ProfileData | null;
    setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>> | null;
    loading: boolean;
}

// URL Params Types
export interface CredentialModelDetailParams {

}
