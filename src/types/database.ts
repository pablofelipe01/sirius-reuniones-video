export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'super_admin' | 'team' | 'guest'
          status: 'pending' | 'approved' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'super_admin' | 'team' | 'guest'
          status?: 'pending' | 'approved' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'super_admin' | 'team' | 'guest'
          status?: 'pending' | 'approved' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          id: string
          title: string
          description: string | null
          room_name: string
          host_id: string
          scheduled_at: string | null
          started_at: string | null
          ended_at: string | null
          is_recording: boolean
          room_style: string
          livekit_room_sid: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          room_name: string
          host_id: string
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          is_recording?: boolean
          room_style?: string
          livekit_room_sid?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          room_name?: string
          host_id?: string
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          is_recording?: boolean
          room_style?: string
          livekit_room_sid?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      meeting_participants: {
        Row: {
          id: string
          meeting_id: string
          user_id: string | null
          guest_name: string | null
          joined_at: string
          left_at: string | null
          speaking_duration_seconds: number
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id?: string | null
          guest_name?: string | null
          joined_at?: string
          left_at?: string | null
          speaking_duration_seconds?: number
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string | null
          guest_name?: string | null
          joined_at?: string
          left_at?: string | null
          speaking_duration_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      meeting_recordings: {
        Row: {
          id: string
          meeting_id: string
          recording_url: string | null
          audio_url: string | null
          duration_seconds: number | null
          file_size_mb: number | null
          assemblyai_transcript_id: string | null
          transcription_status: 'pending' | 'processing' | 'completed' | 'failed'
          transcription: string | null
          speakers: Json | null
          chapters: Json | null
          highlights: Json | null
          sentiment_analysis: Json | null
          summary: string | null
          key_points: Json | null
          action_items: Json | null
          embedding: string | null
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          recording_url?: string | null
          audio_url?: string | null
          duration_seconds?: number | null
          file_size_mb?: number | null
          assemblyai_transcript_id?: string | null
          transcription_status?: 'pending' | 'processing' | 'completed' | 'failed'
          transcription?: string | null
          speakers?: Json | null
          chapters?: Json | null
          highlights?: Json | null
          sentiment_analysis?: Json | null
          summary?: string | null
          key_points?: Json | null
          action_items?: Json | null
          embedding?: string | null
          processed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          recording_url?: string | null
          audio_url?: string | null
          duration_seconds?: number | null
          file_size_mb?: number | null
          assemblyai_transcript_id?: string | null
          transcription_status?: 'pending' | 'processing' | 'completed' | 'failed'
          transcription?: string | null
          speakers?: Json | null
          chapters?: Json | null
          highlights?: Json | null
          sentiment_analysis?: Json | null
          summary?: string | null
          key_points?: Json | null
          action_items?: Json | null
          embedding?: string | null
          processed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_recordings_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          meeting_id: string
          user_id: string | null
          guest_name: string | null
          message: string
          is_system_message: boolean
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id?: string | null
          guest_name?: string | null
          message: string
          is_system_message?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string | null
          guest_name?: string | null
          message?: string
          is_system_message?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      whiteboard_snapshots: {
        Row: {
          id: string
          meeting_id: string
          data: Json
          preview_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          data: Json
          preview_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          data?: Json
          preview_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whiteboard_snapshots_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          }
        ]
      }
      processing_queue: {
        Row: {
          id: string
          meeting_id: string
          job_type: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          attempts: number
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          job_type: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          attempts?: number
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          job_type?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          attempts?: number
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "processing_queue_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          }
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