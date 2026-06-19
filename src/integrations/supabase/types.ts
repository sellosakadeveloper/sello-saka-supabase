export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string;
          survivor_name: string | null;
          date_of_birth: string | null;
          guardian_name: string | null;
          email: string;
          phone: string;
          address: string | null;
          diagnosis_details: string | null;
          treatment_details: string | null;
          current_challenges: string | null;
          programs_interested: string[] | null;
          consent: boolean | null;
          status: string | null;
          created_at: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          survivor_name?: string | null;
          date_of_birth?: string | null;
          guardian_name?: string | null;
          email: string;
          phone: string;
          address?: string | null;
          diagnosis_details?: string | null;
          treatment_details?: string | null;
          current_challenges?: string | null;
          programs_interested?: string[] | null;
          consent?: boolean | null;
          status?: string | null;
          created_at?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          survivor_name?: string | null;
          date_of_birth?: string | null;
          guardian_name?: string | null;
          email?: string;
          phone?: string;
          address?: string | null;
          diagnosis_details?: string | null;
          treatment_details?: string | null;
          current_challenges?: string | null;
          programs_interested?: string[] | null;
          consent?: boolean | null;
          status?: string | null;
          created_at?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Relationships: [];
      };
      competitions: {
        Row: {
          id: string;
          title: string;
          description: string;
          prize: string | null;
          second_prize: string | null;
          third_prize: string | null;
          ticket_price: number | null;
          entry_fee: number | null;
          max_tickets: number | null;
          start_date: string;
          end_date: string;
          status: string | null;
          badge_text: string | null;
          subtitle: string | null;
          hero_image_url: string | null;
          image_url: string | null;
          footer_text_1: string | null;
          footer_text_2: string | null;
          created_at: string | null;
          updated_at: string | null;
          is_active: boolean | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          prize?: string | null;
          second_prize?: string | null;
          third_prize?: string | null;
          ticket_price?: number | null;
          entry_fee?: number | null;
          max_tickets?: number | null;
          start_date: string;
          end_date: string;
          status?: string | null;
          badge_text?: string | null;
          subtitle?: string | null;
          hero_image_url?: string | null;
          image_url?: string | null;
          footer_text_1?: string | null;
          footer_text_2?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          is_active?: boolean | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          prize?: string | null;
          second_prize?: string | null;
          third_prize?: string | null;
          ticket_price?: number | null;
          entry_fee?: number | null;
          max_tickets?: number | null;
          start_date?: string;
          end_date?: string;
          status?: string | null;
          badge_text?: string | null;
          subtitle?: string | null;
          hero_image_url?: string | null;
          image_url?: string | null;
          footer_text_1?: string | null;
          footer_text_2?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          is_active?: boolean | null;
        };
        Relationships: [];
      };
      competition_entries: {
        Row: {
          id: string;
          competition_id: string | null;
          name: string | null;
          full_name: string | null;
          email: string;
          phone: string;
          ticket_number: string | null;
          proof_of_payment_url: string | null;
          payment_method: string | null;
          payment_reference: string | null;
          payment_status: string | null;
          ticket_emailed: boolean | null;
          status: string | null;
          age: number | null;
          story: string | null;
          media_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          competition_id?: string | null;
          name?: string | null;
          full_name?: string | null;
          email: string;
          phone: string;
          ticket_number?: string | null;
          proof_of_payment_url?: string | null;
          payment_method?: string | null;
          payment_reference?: string | null;
          payment_status?: string | null;
          ticket_emailed?: boolean | null;
          status?: string | null;
          age?: number | null;
          story?: string | null;
          media_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          competition_id?: string | null;
          name?: string | null;
          full_name?: string | null;
          email?: string;
          phone?: string;
          ticket_number?: string | null;
          proof_of_payment_url?: string | null;
          payment_method?: string | null;
          payment_reference?: string | null;
          payment_status?: string | null;
          ticket_emailed?: boolean | null;
          status?: string | null;
          age?: number | null;
          story?: string | null;
          media_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "competition_entries_competition_id_fkey";
            columns: ["competition_id"];
            isOneToOne: false;
            referencedRelation: "competitions";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string;
          message?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      donations: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          amount: number;
          donation_type: string;
          payment_method: string | null;
          status: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          amount: number;
          donation_type: string;
          payment_method?: string | null;
          status?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          amount?: number;
          donation_type?: string;
          payment_method?: string | null;
          status?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      impact_stories: {
        Row: {
          id: string;
          title: string;
          excerpt: string | null;
          content: string;
          author: string | null;
          category: string | null;
          date: string | null;
          image_url: string | null;
          is_featured: boolean | null;
          quote: string | null;
          quote_author: string | null;
          impact_summary: string | null;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          excerpt?: string | null;
          content: string;
          author?: string | null;
          category?: string | null;
          date?: string | null;
          image_url?: string | null;
          is_featured?: boolean | null;
          quote?: string | null;
          quote_author?: string | null;
          impact_summary?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          excerpt?: string | null;
          content?: string;
          author?: string | null;
          category?: string | null;
          date?: string | null;
          image_url?: string | null;
          is_featured?: boolean | null;
          quote?: string | null;
          quote_author?: string | null;
          impact_summary?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      impact_metrics: {
        Row: {
          id: string;
          metric_name: string;
          metric_value: number;
          metric_type: string | null;
          year: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          metric_name: string;
          metric_value: number;
          metric_type?: string | null;
          year?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          metric_name?: string;
          metric_value?: number;
          metric_type?: string | null;
          year?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      payment_records: {
        Row: {
          id: string;
          payment_reference: string;
          provider: string;
          status: string;
          purpose: string;
          amount: number;
          currency: string;
          payer_name: string;
          payer_email: string;
          payer_phone: string | null;
          donation_id: string | null;
          competition_entry_id: string | null;
          competition_id: string | null;
          provider_payment_id: string | null;
          provider_status: string | null;
          provider_payload: Json | null;
          return_url: string | null;
          cancel_url: string | null;
          verified_at: string | null;
          completed_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          payment_reference: string;
          provider: string;
          status?: string;
          purpose: string;
          amount: number;
          currency?: string;
          payer_name: string;
          payer_email: string;
          payer_phone?: string | null;
          donation_id?: string | null;
          competition_entry_id?: string | null;
          competition_id?: string | null;
          provider_payment_id?: string | null;
          provider_status?: string | null;
          provider_payload?: Json | null;
          return_url?: string | null;
          cancel_url?: string | null;
          verified_at?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          payment_reference?: string;
          provider?: string;
          status?: string;
          purpose?: string;
          amount?: number;
          currency?: string;
          payer_name?: string;
          payer_email?: string;
          payer_phone?: string | null;
          donation_id?: string | null;
          competition_entry_id?: string | null;
          competition_id?: string | null;
          provider_payment_id?: string | null;
          provider_status?: string | null;
          provider_payload?: Json | null;
          return_url?: string | null;
          cancel_url?: string | null;
          verified_at?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      resources: {
        Row: {
          id: string;
          title: string;
          summary: string | null;
          type: string;
          category: string | null;
          file_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          summary?: string | null;
          type: string;
          category?: string | null;
          file_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          summary?: string | null;
          type?: string;
          category?: string | null;
          file_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          role: string;
          bio: string | null;
          image_url: string | null;
          order_index: number | null;
          social_links: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          bio?: string | null;
          image_url?: string | null;
          order_index?: number | null;
          social_links?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          bio?: string | null;
          image_url?: string | null;
          order_index?: number | null;
          social_links?: Json | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          role: string;
          bio: string | null;
          image_url: string | null;
          linkedin_url: string | null;
          email: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          bio?: string | null;
          image_url?: string | null;
          linkedin_url?: string | null;
          email?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          bio?: string | null;
          image_url?: string | null;
          linkedin_url?: string | null;
          email?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string | null;
          role: Database["public"]["Enums"]["app_role"];
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: "admin" | "moderator" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
