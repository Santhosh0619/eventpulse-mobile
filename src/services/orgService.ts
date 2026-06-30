import { api } from '@/services/api'
import type { Member, Organization, OrgWithRole } from '@/types/organization'

const BASE = '/api/v1/organizations'

/** Organization and membership API calls (read + invitation acceptance). */
export const orgService = {
  /** List the organizations the current user belongs to, with their role. */
  async listMine(): Promise<OrgWithRole[]> {
    const { data } = await api.get<OrgWithRole[]>(
      '/api/v1/users/me/organizations',
    )
    return data
  },

  async get(id: string): Promise<Organization> {
    const { data } = await api.get<Organization>(`${BASE}/${id}`)
    return data
  },

  async listMembers(id: string): Promise<Member[]> {
    const { data } = await api.get<Member[]>(`${BASE}/${id}/members`)
    return data
  },

  async acceptInvitation(token: string): Promise<Member> {
    const { data } = await api.post<Member>(
      `${BASE}/invitations/${token}/accept`,
    )
    return data
  },
}
