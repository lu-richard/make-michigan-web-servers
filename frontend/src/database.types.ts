export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  private: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      view_equipment_cards: {
        Row: {
          building: string
          capabilities: string[] | null
          equipment_id: string
          equipment_model_name: string
          equipment_type: string
          fts: unknown
          manufacturer_image_urls: string[] | null
          materials: string[] | null
          rooms: string[] | null
        }
        Relationships: []
      }
      view_makerspace_cards: {
        Row: {
          building: string
          cover_image: string | null
          description: string | null
          fts: unknown
          makerspace_id: string
          makerspace_name: string
          rooms: string[] | null
          themes: Database["public"]["Enums"]["makerspace_theme"][] | null
        }
        Relationships: []
      }
      credential_summary: { // view 
        Row: {
          credential_id: string
          credential_model_id: string
          credential_model_name: string
          credential_status: Database["public"]["Enums"]["credential_status"][]
          author_first_name: string
          author_last_name: string
          completion_date: string | null
          expiration_date: string | null
          makerspace_name: string
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      credential_model_prerequisites: {
        Row: {
          created_at: string
          dependent_credential_model_id: string
          last_updated: string
          prerequisite_credential_model_id: string
        }
        Insert: {
          created_at?: string
          dependent_credential_model_id: string
          last_updated?: string
          prerequisite_credential_model_id: string
        }
        Update: {
          created_at?: string
          dependent_credential_model_id?: string
          last_updated?: string
          prerequisite_credential_model_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credential_model_prerequisites_dependent_id_fkey"
            columns: ["dependent_credential_model_id"]
            isOneToOne: false
            referencedRelation: "credential_models"
            referencedColumns: ["credential_model_id"]
          },
          {
            foreignKeyName: "credential_model_prerequisites_prerequisite_id_fkey"
            columns: ["prerequisite_credential_model_id"]
            isOneToOne: false
            referencedRelation: "credential_models"
            referencedColumns: ["credential_model_id"]
          },
        ]
      }
      credential_models: {
        Row: {
          created_at: string
          credential_model_id: string
          credential_model_name: string
          credential_type: Database["public"]["Enums"]["credential_type"]
          description: string | null
          last_updated: string
        }
        Insert: {
          created_at?: string
          credential_model_id?: string
          credential_model_name: string
          credential_type: Database["public"]["Enums"]["credential_type"]
          description?: string | null
          last_updated?: string
        }
        Update: {
          created_at?: string
          credential_model_id?: string
          credential_model_name?: string
          credential_type?: Database["public"]["Enums"]["credential_type"]
          description?: string | null
          last_updated?: string
        }
        Relationships: []
      }
      credentials: {
        Row: {
          author_user_id: string
          created_at: string
          credential_id: string
          credential_model_id: string
          credential_status: Database["public"]["Enums"]["credential_status"]
          expiration_date: string | null
          issue_date: string | null
          issuing_makerspace_id: string
          last_updated: string
          recipient_user_id: string
        }
        Insert: {
          author_user_id: string
          created_at?: string
          credential_id?: string
          credential_model_id: string
          credential_status: Database["public"]["Enums"]["credential_status"]
          expiration_date?: string | null
          issue_date?: string | null
          issuing_makerspace_id: string
          last_updated?: string
          recipient_user_id: string
        }
        Update: {
          author_user_id?: string
          created_at?: string
          credential_id?: string
          credential_model_id?: string
          credential_status?: Database["public"]["Enums"]["credential_status"]
          expiration_date?: string | null
          issue_date?: string | null
          issuing_makerspace_id?: string
          last_updated?: string
          recipient_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credentials_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "credentials_credential_model_id_fkey"
            columns: ["credential_model_id"]
            isOneToOne: false
            referencedRelation: "credential_models"
            referencedColumns: ["credential_model_id"]
          },
          {
            foreignKeyName: "credentials_issuing_makerspace_id_fkey"
            columns: ["issuing_makerspace_id"]
            isOneToOne: false
            referencedRelation: "makerspaces"
            referencedColumns: ["makerspace_id"]
          },
          {
            foreignKeyName: "credentials_issuing_makerspace_id_fkey"
            columns: ["issuing_makerspace_id"]
            isOneToOne: false
            referencedRelation: "view_makerspace_detail_pages"
            referencedColumns: ["makerspace_id"]
          },
          {
            foreignKeyName: "credentials_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      equipment: {
        Row: {
          created_at: string
          credential_model_id: string | null
          equipment_id: string
          equipment_model_id: string
          equipment_name: string
          equipment_status:
            | Database["public"]["Enums"]["equipment_status"]
            | null
          in_situ_image_url: string | null
          last_serviced: string | null
          last_updated: string
          makerspace_id: string
          materials: string[] | null
          notes: string | null
          restricted_materials: string[] | null
          specific_specs: Json | null
        }
        Insert: {
          created_at?: string
          credential_model_id?: string | null
          equipment_id?: string
          equipment_model_id: string
          equipment_name: string
          equipment_status?:
            | Database["public"]["Enums"]["equipment_status"]
            | null
          in_situ_image_url?: string | null
          last_serviced?: string | null
          last_updated?: string
          makerspace_id: string
          materials?: string[] | null
          notes?: string | null
          restricted_materials?: string[] | null
          specific_specs?: Json | null
        }
        Update: {
          created_at?: string
          credential_model_id?: string | null
          equipment_id?: string
          equipment_model_id?: string
          equipment_name?: string
          equipment_status?:
            | Database["public"]["Enums"]["equipment_status"]
            | null
          in_situ_image_url?: string | null
          last_serviced?: string | null
          last_updated?: string
          makerspace_id?: string
          materials?: string[] | null
          notes?: string | null
          restricted_materials?: string[] | null
          specific_specs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_credential_model_id_fkey"
            columns: ["credential_model_id"]
            isOneToOne: false
            referencedRelation: "credential_models"
            referencedColumns: ["credential_model_id"]
          },
          {
            foreignKeyName: "equipment_equipment_model_id_fkey"
            columns: ["equipment_model_id"]
            isOneToOne: false
            referencedRelation: "equipment_models"
            referencedColumns: ["equipment_model_id"]
          },
          {
            foreignKeyName: "equipment_makerspace_id_fkey"
            columns: ["makerspace_id"]
            isOneToOne: false
            referencedRelation: "makerspaces"
            referencedColumns: ["makerspace_id"]
          },
          {
            foreignKeyName: "equipment_makerspace_id_fkey"
            columns: ["makerspace_id"]
            isOneToOne: false
            referencedRelation: "view_makerspace_detail_pages"
            referencedColumns: ["makerspace_id"]
          },
        ]
      }
      equipment_models: {
        Row: {
          capabilities: string[] | null
          created_at: string
          equipment_model_id: string
          equipment_model_name: string
          equipment_type: string
          is_cnc: boolean
          last_updated: string
          make: string
          manufacturer_image_urls: string[] | null
          model: string
          specific_specs: Json | null
          specs_url: string | null
        }
        Insert: {
          capabilities?: string[] | null
          created_at?: string
          equipment_model_id?: string
          equipment_model_name: string
          equipment_type: string
          is_cnc: boolean
          last_updated?: string
          make: string
          manufacturer_image_urls?: string[] | null
          model: string
          specific_specs?: Json | null
          specs_url?: string | null
        }
        Update: {
          capabilities?: string[] | null
          created_at?: string
          equipment_model_id?: string
          equipment_model_name?: string
          equipment_type?: string
          is_cnc?: boolean
          last_updated?: string
          make?: string
          manufacturer_image_urls?: string[] | null
          model?: string
          specific_specs?: Json | null
          specs_url?: string | null
        }
        Relationships: []
      }
      issue_reports: {
        Row: {
          created_at: string
          description: string
          equipment_id: string
          is_resolved: boolean | null
          issue_report_id: string
          issue_type: string
          last_updated: string
          overseer_user_id: string | null
          reporter_user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          equipment_id: string
          is_resolved?: boolean | null
          issue_report_id?: string
          issue_type: string
          last_updated?: string
          overseer_user_id?: string | null
          reporter_user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          equipment_id?: string
          is_resolved?: boolean | null
          issue_report_id?: string
          issue_type?: string
          last_updated?: string
          overseer_user_id?: string | null
          reporter_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_reports_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "issue_reports_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "view_equipment_detail_pages"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "issue_reports_overseer_user_id_fkey"
            columns: ["overseer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "issue_reports_reporter_user_id_fkey"
            columns: ["reporter_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      makerspace_credential_models: {
        Row: {
          created_at: string
          credential_model_id: string
          last_updated: string
          makerspace_id: string
        }
        Insert: {
          created_at?: string
          credential_model_id: string
          last_updated?: string
          makerspace_id: string
        }
        Update: {
          created_at?: string
          credential_model_id?: string
          last_updated?: string
          makerspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "makerspace_credential_models_credential_model_id_fkey"
            columns: ["credential_model_id"]
            isOneToOne: false
            referencedRelation: "credential_models"
            referencedColumns: ["credential_model_id"]
          },
          {
            foreignKeyName: "makerspace_credential_models_makerspace_id_fkey"
            columns: ["makerspace_id"]
            isOneToOne: false
            referencedRelation: "makerspaces"
            referencedColumns: ["makerspace_id"]
          },
          {
            foreignKeyName: "makerspace_credential_models_makerspace_id_fkey"
            columns: ["makerspace_id"]
            isOneToOne: false
            referencedRelation: "view_makerspace_detail_pages"
            referencedColumns: ["makerspace_id"]
          },
        ]
      }
      makerspaces: {
        Row: {
          audience: string[] | null
          building: string
          contact_email: string
          contact_phone: string
          cover_image: string | null
          created_at: string
          description: string | null
          last_updated: string
          latitude: number
          longitude: number
          makerspace_id: string
          makerspace_name: string
          makerspace_status:
            | Database["public"]["Enums"]["makerspace_status"]
            | null
          makerspace_tier: Database["public"]["Enums"]["makerspace_tier"] | null
          rooms: string[] | null
          themes: Database["public"]["Enums"]["makerspace_theme"][] | null
        }
        Insert: {
          audience?: string[] | null
          building: string
          contact_email: string
          contact_phone: string
          cover_image?: string | null
          created_at?: string
          description?: string | null
          last_updated?: string
          latitude: number
          longitude: number
          makerspace_id?: string
          makerspace_name: string
          makerspace_status?:
            | Database["public"]["Enums"]["makerspace_status"]
            | null
          makerspace_tier?:
            | Database["public"]["Enums"]["makerspace_tier"]
            | null
          rooms?: string[] | null
          themes?: Database["public"]["Enums"]["makerspace_theme"][] | null
        }
        Update: {
          audience?: string[] | null
          building?: string
          contact_email?: string
          contact_phone?: string
          cover_image?: string | null
          created_at?: string
          description?: string | null
          last_updated?: string
          latitude?: number
          longitude?: number
          makerspace_id?: string
          makerspace_name?: string
          makerspace_status?:
            | Database["public"]["Enums"]["makerspace_status"]
            | null
          makerspace_tier?:
            | Database["public"]["Enums"]["makerspace_tier"]
            | null
          rooms?: string[] | null
          themes?: Database["public"]["Enums"]["makerspace_theme"][] | null
        }
        Relationships: []
      }
      operational_data: {
        Row: {
          created_at: string
          downtime: number | null
          equipment_id: string
          last_updated: string
          lifetime_hours: number | null
          monthly_users: number | null
          num_lifetime_reports: number | null
        }
        Insert: {
          created_at?: string
          downtime?: number | null
          equipment_id: string
          last_updated?: string
          lifetime_hours?: number | null
          monthly_users?: number | null
          num_lifetime_reports?: number | null
        }
        Update: {
          created_at?: string
          downtime?: number | null
          equipment_id?: string
          last_updated?: string
          lifetime_hours?: number | null
          monthly_users?: number | null
          num_lifetime_reports?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "operational_data_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: true
            referencedRelation: "equipment"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "operational_data_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: true
            referencedRelation: "view_equipment_detail_pages"
            referencedColumns: ["equipment_id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          last_updated: string | null
          post_id: string
          post_image_urls: string[] | null
          title: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          last_updated?: string | null
          post_id?: string
          post_image_urls?: string[] | null
          title?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          last_updated?: string | null
          post_id?: string
          post_image_urls?: string[] | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string
          image_url: string | null
          is_grad_student: boolean
          last_name: string
          last_signed_in: string
          locale: Database["public"]["Enums"]["locale"]
          middle_initial: string | null
          pronouns: string | null
          roles: Database["public"]["Enums"]["role"][] | null
          system_theme: Database["public"]["Enums"]["system_theme"]
          uniqname: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name: string
          image_url?: string | null
          is_grad_student?: boolean
          last_name: string
          last_signed_in?: string
          locale?: Database["public"]["Enums"]["locale"]
          middle_initial?: string | null
          pronouns?: string | null
          roles?: Database["public"]["Enums"]["role"][] | null
          system_theme?: Database["public"]["Enums"]["system_theme"]
          uniqname: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string
          image_url?: string | null
          is_grad_student?: boolean
          last_name?: string
          last_signed_in?: string
          locale?: Database["public"]["Enums"]["locale"]
          middle_initial?: string | null
          pronouns?: string | null
          roles?: Database["public"]["Enums"]["role"][] | null
          system_theme?: Database["public"]["Enums"]["system_theme"]
          uniqname?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      view_credential_model_prerequisites: {
        Row: {
          dependent_credential_model_name: string | null
          prerequisite_credential_model_name: string | null
        }
        Relationships: []
      }
      view_equipment_detail_pages: {
        Row: {
          building: string
          capabilities: string[] | null
          credential_model_id: string | null
          credential_model_name: string | null
          equipment_id: string
          equipment_model_name: string
          equipment_model_specific_specs: Json | null
          equipment_specific_specs: Json | null
          equipment_status:
            | Database["public"]["Enums"]["equipment_status"]
            | null
          equipment_type: string
          in_situ_image_url: string | null
          is_cnc: boolean
          last_serviced: string | null
          make: string
          makerspace_id: string
          makerspace_name: string
          manufacturer_image_urls: string[] | null
          materials: string[] | null
          model: string
          notes: string | null
          restricted_materials: string[] | null
          rooms: string[] | null
          specs_url: string | null
        }
        Relationships: []
      }
      view_makerspace_detail_pages: {
        Row: {
          audience: string[] | null
          building: string
          contact_email: string
          contact_phone: string
          cover_image: string | null
          description: string | null
          equipment_list: Json[] | null
          makerspace_id: string
          makerspace_name: string
          makerspace_status:
            | Database["public"]["Enums"]["makerspace_status"]
            | null
          rooms: string[] | null
          theme: Database["public"]["Enums"]["makerspace_theme"][] | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      credential_status:
        | "active"
        | "pending"
        | "superseded"
        | "expired"
        | "revoked"
      credential_type: "safety" | "equipment"
      equipment_status:
        | "open"
        | "closed"
        | "in_use"
        | "reserved"
        | "under_maintenance"
        | "out_of_order"
      locale:
        | "en_US"
        | "en_GB"
        | "zh_CN"
        | "es_ES"
        | "es_MX"
        | "es_LA"
        | "hi_IN"
        | "ar"
        | "fr_FR"
        | "fr_CA"
        | "de_DE"
        | "ja_JP"
        | "pt_BR"
        | "pt_PT"
        | "ru_RU"
      makerspace_status: "open" | "closed" | "reserved" | "soft_open"
      makerspace_theme:
        | "electronics"
        | "3d_printing"
        | "woodworking"
        | "collaborative"
        | "music"
        | "fiber_arts"
      makerspace_tier: "basic"
      role: "student" | "alum" | "staff" | "shop_manager" | "shop_mentor"
      system_theme: "light" | "dark"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  private: {
    Enums: {},
  },
  public: {
    Enums: {
      credential_status: [
        "active_user",
        "pending_user",
        "operator",
        "expired",
        "invalidated",
      ],
      credential_type: ["safety", "equipment"],
      equipment_status: [
        "open",
        "closed",
        "in_use",
        "reserved",
        "under_maintenance",
        "out_of_order",
      ],
      locale: [
        "en_US",
        "en_GB",
        "zh_CN",
        "es_ES",
        "es_MX",
        "es_LA",
        "hi_IN",
        "ar",
        "fr_FR",
        "fr_CA",
        "de_DE",
        "ja_JP",
        "pt_BR",
        "pt_PT",
        "ru_RU",
      ],
      makerspace_status: ["open", "closed", "reserved", "soft_open"],
      makerspace_theme: [
        "electronics",
        "3d_printing",
        "woodworking",
        "collaborative",
        "music",
        "fiber_arts",
      ],
      makerspace_tier: ["basic"],
      role: ["student", "alum", "staff", "shop_manager", "shop_mentor"],
      system_theme: ["light", "dark"],
    },
  },
} as const
