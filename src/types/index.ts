// Database Types
export type UserRole = 'super_admin' | 'team' | 'guest';
export type UserStatus = 'pending' | 'approved' | 'blocked';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  room_name: string;
  host_id: string;
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  is_recording: boolean;
  room_style: RoomStyle;
  livekit_room_sid?: string;
  created_at: string;
  host?: User;
  participants?: MeetingParticipant[];
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id?: string;
  guest_name?: string;
  joined_at: string;
  left_at?: string;
  speaking_duration_seconds: number;
  user?: User;
}

export interface MeetingRecording {
  id: string;
  meeting_id: string;
  recording_url?: string;
  audio_url?: string;
  duration_seconds?: number;
  file_size_mb?: number;
  assemblyai_transcript_id?: string;
  transcription_status: ProcessingStatus;
  transcription?: string;
  speakers?: unknown[];
  chapters?: unknown[];
  highlights?: unknown[];
  sentiment_analysis?: unknown;
  summary?: string;
  key_points?: unknown[];
  action_items?: unknown[];
  embedding?: number[];
  processed_at?: string;
  created_at: string;
  meeting?: Meeting;
}

export interface ChatMessage {
  id: string;
  meeting_id: string;
  user_id?: string;
  guest_name?: string;
  message: string;
  is_system_message: boolean;
  created_at: string;
  user?: User;
}

export interface WhiteboardSnapshot {
  id: string;
  meeting_id: string;
  data: unknown;
  preview_url?: string;
  created_at: string;
}

export interface ProcessingQueue {
  id: string;
  meeting_id: string;
  job_type: 'transcription' | 'summary' | 'embedding';
  status: ProcessingStatus;
  attempts: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// UI Types
export type RoomStyle = 'futuristic' | 'neon' | 'space' | 'minimal' | 'cyberpunk' | 'synthwave';

export interface Room3DConfig {
  style: RoomStyle;
  backgroundColor: string;
  particleCount: number;
  gridVisible: boolean;
  neonEffects: boolean;
  animationSpeed: number;
}

export interface ParticipantTileProps {
  participantId: string;
  name: string;
  avatarUrl?: string;
  isSpeaking: boolean;
  isHost: boolean;
  isLocalParticipant: boolean;
  role: UserRole;
  style: RoomStyle;
}

// LiveKit Types
export interface LiveKitToken {
  token: string;
  roomName: string;
  participantName: string;
  metadata?: unknown;
}

// AssemblyAI Types
export interface TranscriptionSegment {
  id: string;
  text: string;
  start: number;
  end: number;
  speaker?: string;
  confidence: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface RealtimeTranscriptData {
  message_type: 'PartialTranscript' | 'FinalTranscript';
  text: string;
  start?: number;
  end?: number;
  confidence?: number;
  speaker?: string;
}

// OpenAI Types
export interface MeetingSummary {
  executive_summary: string;
  key_points: string[];
  action_items: Array<{
    task: string;
    assignee?: string;
    due_date?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  decisions_made: string[];
  next_steps: string[];
  sentiment_overview: {
    overall_sentiment: 'positive' | 'negative' | 'neutral';
    key_topics: Array<{
      topic: string;
      sentiment: 'positive' | 'negative' | 'neutral';
    }>;
  };
}

// Component Props
export interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'neon' | 'holographic' | 'glitch' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  pulse?: boolean;
  glow?: boolean;
}

export interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
}

export interface NeonTextProps {
  children: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

// Hook Types
export interface UseMeetingReturn {
  meeting: Meeting | null;
  participants: MeetingParticipant[];
  isLoading: boolean;
  error: string | null;
  joinMeeting: (roomName: string, participantName: string) => Promise<void>;
  leaveMeeting: () => Promise<void>;
  isConnected: boolean;
  localParticipant: unknown;
  remoteParticipants: unknown[];
}

export interface UseAuthReturn {
  user: User | null;
  session: unknown;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isTeamMember: boolean;
  canCreateMeeting: boolean;
} 