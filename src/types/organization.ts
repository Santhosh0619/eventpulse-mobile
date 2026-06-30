export type OrgRole = 'owner' | 'admin' | 'member'

/** An organization (mirrors the backend OrgRead schema). */
export interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  website: string | null
  contact_email: string
  is_verified: boolean
  created_by: string | null
  created_at: string
}

/** An organization plus the current user's role within it. */
export interface OrgWithRole extends Organization {
  my_role: OrgRole
}

/** A membership record. */
export interface Member {
  id: string
  organization_id: string
  user_id: string | null
  role: OrgRole
  invited_email: string | null
  invitation_status: 'pending' | 'accepted' | 'declined'
  joined_at: string | null
}
