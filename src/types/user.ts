/** User & profile types mirroring the backend `UserRead` / `ProfileRead` schemas. */

export interface UserProfile {
  first_name: string
  last_name: string
  phone?: string | null
  avatar_url?: string | null
  bio?: string | null
  date_of_birth?: string | null
  city?: string | null
  country?: string | null
  preferences?: Record<string, unknown>
}

export interface AuthUser {
  id: string
  email: string
  role: string
  is_active: boolean
  is_verified: boolean
  created_at?: string
  profile?: UserProfile | null
}

/** Editable profile fields (PUT /users/me). All optional — only sent if changed. */
export interface ProfileUpdate {
  first_name?: string
  last_name?: string
  phone?: string | null
  bio?: string | null
  date_of_birth?: string | null
  city?: string | null
  country?: string | null
  preferences?: Record<string, unknown>
}
