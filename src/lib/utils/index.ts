import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function generateRoomName(): string {
  const adjectives = [
    'quantum', 'neural', 'digital', 'cyber', 'stellar', 'cosmic', 'neon', 'holographic',
    'synthetic', 'binary', 'virtual', 'matrix', 'plasma', 'electric', 'magnetic', 'atomic'
  ];
  
  const nouns = [
    'nexus', 'core', 'hub', 'node', 'grid', 'dome', 'chamber', 'vault',
    'sphere', 'portal', 'gateway', 'beacon', 'prism', 'crystal', 'circuit', 'reactor'
  ];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 9999) + 1;
  
  return `${adjective}-${noun}-${number}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isTeamEmail(email: string): boolean {
  return email.endsWith('@siriusregenerative.com');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function timeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
}

export function generateGuestName(): string {
  const adjectives = [
    'Anonymous', 'Digital', 'Cyber', 'Quantum', 'Neural', 'Virtual', 'Synthetic',
    'Binary', 'Matrix', 'Plasma', 'Electric', 'Magnetic', 'Atomic', 'Stellar'
  ];
  
  const nouns = [
    'User', 'Guest', 'Visitor', 'Participant', 'Attendee', 'Observer', 'Entity',
    'Avatar', 'Presence', 'Signal', 'Node', 'Agent', 'Unit', 'Client'
  ];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return `${adjective} ${noun} ${number}`;
}

export function getRandomColor(): string {
  const colors = [
    '#00F5FF', // cyan
    '#B026FF', // purple
    '#FF006E', // pink
    '#39FF14', // green
    '#FF6B00', // orange
    '#00E6FF', // light blue
    '#FF0080', // magenta
    '#80FF00', // lime
    '#FF4000', // red-orange
    '#0080FF'  // blue
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function parseTranscriptTimestamp(timestamp: number): string {
  const minutes = Math.floor(timestamp / 60000);
  const seconds = Math.floor((timestamp % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function highlightSearchTerms(text: string, searchTerm: string): string {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-300 text-black">$1</mark>');
}

export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

interface TranscriptSegment {
  speaker?: string;
  start: number;
  end: number;
}

export function calculateSpeakingTime(segments: TranscriptSegment[]): { [speaker: string]: number } {
  const speakingTime: { [speaker: string]: number } = {};
  
  segments.forEach(segment => {
    if (segment.speaker) {
      const duration = segment.end - segment.start;
      speakingTime[segment.speaker] = (speakingTime[segment.speaker] || 0) + duration;
    }
  });
  
  return speakingTime;
}

export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const color = hexColor.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
} 