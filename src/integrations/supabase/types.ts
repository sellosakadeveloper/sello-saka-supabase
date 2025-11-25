export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          address: string | null
          consent: boolean | null
          created_at: string | null
          current_challenges: string | null
          date_of_birth: string | null
          diagnosis_details: string | null
          email: string
          guardian_name: string | null
          id: string
          phone: string
          programs_interested: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          survivor_name: string | null
          treatment_details: string | null
        }
        Insert: {
          address?: string | null
          consent?: boolean | null
          created_at?: string | null
          current_challenges?: string | null
          date_of_birth?: string | null
          diagnosis_details?: string | null
          email: string
          guardian_name?: string | null
          id?: string
          phone: string
          programs_interested?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          survivor_name?: string | null
          treatment_details?: string | null
        }
        Update: {
          address?: string | null
          consent?: boolean | null
          created_at?: string | null
          current_challenges?: string | null
          date_of_birth?: string | null
          diagnosis_details?: string | null
          email?: string
          guardian_name?: string | null
          id?: string
          phone?: string
          programs_interested?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          survivor_name?: string | null
          treatment_details?: string | null
        }
        Relationships: []
      }
      competition_entries: {
        Row: {
          age: number
          competition_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          media_url: string | null
          phone: string
          status: string | null
          story: string | null
        }
        Insert: {
          age: number
          competition_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          media_url?: string | null
          phone: string
          status?: string | null
          story?: string | null
        }
        Update: {
          age?: number
          competition_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          media_url?: string | null
          phone?: string
          status?: string | null
          story?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_entries_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string | null
          description: string
          end_date: string
          hero_image_url: string | null
          id: string
          is_active: boolean | null
          requirements: string[] | null
          start_date: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          end_date: string
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          requirements?: string[] | null
          start_date: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          end_date?: string
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          requirements?: string[] | null
          start_date?: string
          title?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      donors: {
        Row: {
          amount: number
          created_at: string | null
          email: string | null
          id: string
          message: string | null
          name: string | null
          payment_method: string | null
          payment_status: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
        }
        Relationships: []
      }
      impact_stories: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string | null
          date: string
          excerpt: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          title: string
        }
        Insert: {
          author: string
          category: string
          content: string
          created_at?: string | null
          date: string
          excerpt: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          title: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string | null
          date?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          title?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string | null
          created_at: string | null
          file_url: string | null
          id: string
          summary: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          summary?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          summary?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          order_index: number | null
          role: string
          social_links: Json | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          order_index?: number | null
          role: string
          social_links?: Json | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          order_index?: number | null
          role?: string
          social_links?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

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
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

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
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never
