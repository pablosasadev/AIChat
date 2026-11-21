// User data returned by the API after authentication
export interface User {
  email: string;
  fullName: string;
}

// Response body from /api/auth/login and /api/auth/register
export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  expiresAt: string;
}

// Message in a conversation
export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

// Conversation entity
export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}