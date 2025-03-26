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
      campsites: {
        Row: {
          accessibility: number
          cell_signal: number
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string
          images: string[] | null
          land_type: string
          latitude: number
          location: string
          longitude: number
          name: string
          quietness: number
          review_count: number | null
          safety_rating: number
        }
        Insert: {
          accessibility: number
          cell_signal: number
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          land_type: string
          latitude: number
          location: string
          longitude: number
          name: string
          quietness: number
          review_count?: number | null
          safety_rating: number
        }
        Update: {
          accessibility?: number
          cell_signal?: number
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          land_type?: string
          latitude?: number
          location?: string
          longitude?: number
          name?: string
          quietness?: number
          review_count?: number | null
          safety_rating?: number
        }
        Relationships: []
      }
      flags: {
        Row: {
          created_at: string | null
          details: string | null
          id: string
          reason: string
          site_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          id?: string
          reason: string
          site_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: string | null
          id?: string
          reason?: string
          site_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flags_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "campsites"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          cell_signal: number
          comment: string | null
          created_at: string | null
          id: string
          images: string[] | null
          noise_level: number
          safety_rating: number
          site_id: string | null
          user_avatar: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          cell_signal: number
          comment?: string | null
          created_at?: string | null
          id?: string
          images?: string[] | null
          noise_level: number
          safety_rating: number
          site_id?: string | null
          user_avatar?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          cell_signal?: number
          comment?: string | null
          created_at?: string | null
          id?: string
          images?: string[] | null
          noise_level?: number
          safety_rating?: number
          site_id?: string | null
          user_avatar?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "campsites"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string | null
          end_location: string
          id: string
          is_guest: boolean | null
          name: string
          owner_id: string
          route_data: Json | null
          start_location: string
          stops: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_location: string
          id?: string
          is_guest?: boolean | null
          name: string
          owner_id: string
          route_data?: Json | null
          start_location: string
          stops?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_location?: string
          id?: string
          is_guest?: boolean | null
          name?: string
          owner_id?: string
          route_data?: Json | null
          start_location?: string
          stops?: Json
          updated_at?: string | null
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
      [_ in never]: never
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
