
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      campsites: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          location: string;
          latitude: number;
          longitude: number;
          land_type: string;
          safety_rating: number;
          cell_signal: number;
          accessibility: number;
          quietness: number;
          features: string[] | null;
          images: string[] | null;
          review_count: number | null;
          created_at: string | null;
          type: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          location: string;
          latitude: number;
          longitude: number;
          land_type: string;
          safety_rating: number;
          cell_signal: number;
          accessibility: number;
          quietness: number;
          features?: string[] | null;
          images?: string[] | null;
          review_count?: number | null;
          created_at?: string | null;
          type?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          location?: string;
          latitude?: number;
          longitude?: number;
          land_type?: string;
          safety_rating?: number;
          cell_signal?: number;
          accessibility?: number;
          quietness?: number;
          features?: string[] | null;
          images?: string[] | null;
          review_count?: number | null;
          created_at?: string | null;
          type?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          site_id: string | null;
          user_id: string;
          user_name: string;
          user_avatar: string | null;
          safety_rating: number;
          cell_signal: number;
          noise_level: number;
          comment: string | null;
          images: string[] | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          site_id?: string | null;
          user_id: string;
          user_name: string;
          user_avatar?: string | null;
          safety_rating: number;
          cell_signal: number;
          noise_level: number;
          comment?: string | null;
          images?: string[] | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          site_id?: string | null;
          user_id?: string;
          user_name?: string;
          user_avatar?: string | null;
          safety_rating?: number;
          cell_signal?: number;
          noise_level?: number;
          comment?: string | null;
          images?: string[] | null;
          created_at?: string | null;
        };
      };
      flags: {
        Row: {
          id: string;
          site_id: string | null;
          user_id: string;
          reason: string;
          details: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          site_id?: string | null;
          user_id: string;
          reason: string;
          details?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          site_id?: string | null;
          user_id?: string;
          reason?: string;
          details?: string | null;
          created_at?: string | null;
        };
      };
      trips: {
        Row: {
          id: string;
          owner_id: string;
          is_guest: boolean | null;
          name: string;
          start_location: string;
          end_location: string;
          stops: Json;
          route_data: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          is_guest?: boolean | null;
          name: string;
          start_location: string;
          end_location: string;
          stops?: Json;
          route_data?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string;
          is_guest?: boolean | null;
          name?: string;
          start_location?: string;
          end_location?: string;
          stops?: Json;
          route_data?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
