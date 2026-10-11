export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AudioCategory =
  | 'general'
  | 'musica'
  | 'podcast'
  | 'reflexion'
  | 'historia'
  | 'humor'
  | 'voz-en-off'
  | 'naturaleza'
  | 'otro';

export type AudioStatus = 'published' | 'draft' | 'archived';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audios: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          storage_path: string;
          mime_type: string;
          file_size: number;
          duration_seconds: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category?: string;
          storage_path: string;
          mime_type: string;
          file_size: number;
          duration_seconds?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          storage_path?: string;
          mime_type?: string;
          file_size?: number;
          duration_seconds?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          audio_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          audio_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          audio_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
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
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type AudioRow = Database['public']['Tables']['audios']['Row'];
export type CommentRow = Database['public']['Tables']['comments']['Row'];

// Audio extendido con información del perfil autor
export interface AudioWithProfile extends AudioRow {
  profile: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_path'>;
  comments_count?: number;
}

// Comentario extendido con información del perfil autor
export interface CommentWithProfile extends CommentRow {
  profile: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_path'>;
}
