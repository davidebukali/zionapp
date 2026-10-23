import z from "zod";

export interface UserProfile {
  id?: string;
  user_id?: string;
  username?: string;
  display_name?: string;
  bio?: string | null;
  avatar_media_id?: string | null;
  cover_media_id?: string | null;
  website?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  profile?: UserProfile;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  access_token?: string;
  data?: {
    token?: string;
    access_token?: string;
    user?: User;
  };
  resource?: User;
  user?: User;
  message?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  resource?: User;
  data?: {
    user?: User;
    token?: string;
    access_token?: string;
  };
  token?: string;
  access_token?: string;
  message?: string;
  with?: any[];
  additional?: any[];
}

export interface MeResponse {
  data?: User;
  resource?: User;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type SubmissionPhase = "idle" | "creating_account" | "logging_in";