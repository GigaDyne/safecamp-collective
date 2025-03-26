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
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          donor_id: string
          help_request_id: string | null
          id: string
          message: string | null
          recipient_id: string
          stripe_payment_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          donor_id: string
          help_request_id?: string | null
          id?: string
          message?: string | null
          recipient_id: string
          stripe_payment_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          donor_id?: string
          help_request_id?: string | null
          id?: string
          message?: string | null
          recipient_id?: string
          stripe_payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_help_request_id_fkey"
            columns: ["help_request_id"]
            isOneToOne: false
            referencedRelation: "help_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_campsites: {
        Row: {
          created_at: string | null
          description: string
          id: string
          image_url: string
          latitude: number
          location: string
          longitude: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          image_url: string
          latitude: number
          location: string
          longitude: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string
          latitude?: number
          location?: string
          longitude?: number
          name?: string
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
      help_requests: {
        Row: {
          amount_received: number | null
          amount_requested: number | null
          created_at: string
          description: string
          id: string
          is_active: boolean | null
          location: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_received?: number | null
          amount_requested?: number | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_received?: number | null
          amount_requested?: number | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      premium_campsites: {
        Row: {
          campsite_id: string
          created_at: string
          description: string
          id: string
          price: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campsite_id: string
          created_at?: string
          description: string
          id?: string
          price: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campsite_id?: string
          created_at?: string
          description?: string
          id?: string
          price?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_campsites_campsite_id_fkey"
            columns: ["campsite_id"]
            isOneToOne: true
            referencedRelation: "campsites"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_comments: {
        Row: {
          commenter_id: string
          content: string
          created_at: string
          id: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          commenter_id: string
          content: string
          created_at?: string
          id?: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          commenter_id?: string
          content?: string
          created_at?: string
          id?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: []
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
      subscription_plans: {
        Row: {
          created_at: string
          creator_id: string
          description: string
          id: string
          name: string
          price: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description: string
          id?: string
          name: string
          price: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string
          id?: string
          name?: string
          price?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
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
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          is_creator: boolean | null
          stripe_account_id: string | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          is_creator?: boolean | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_creator?: boolean | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          creator_id: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_subscription_id: string
          subscriber_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          status: string
          stripe_subscription_id: string
          subscriber_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string
          subscriber_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
