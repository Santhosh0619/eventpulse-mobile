import { api } from '@/services/api'
import { orgService } from '@/services/orgService'

jest.mock('@/services/api', () => ({
  api: { get: jest.fn(), post: jest.fn() },
}))

const mockApi = api as unknown as { get: jest.Mock; post: jest.Mock }

describe('orgService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('listMine fetches the current user organizations', async () => {
    const orgs = [{ id: 'o1', name: 'Acme', my_role: 'owner' }]
    mockApi.get.mockResolvedValueOnce({ data: orgs })

    const result = await orgService.listMine()

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/users/me/organizations')
    expect(result).toEqual(orgs)
  })

  it('get fetches a single organization', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { id: 'o1' } })
    await orgService.get('o1')
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/organizations/o1')
  })

  it('listMembers fetches members for an org', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await orgService.listMembers('o1')
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/organizations/o1/members')
  })

  it('acceptInvitation posts to the token accept endpoint', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { id: 'm1', role: 'member' } })
    const member = await orgService.acceptInvitation('tok123')
    expect(mockApi.post).toHaveBeenCalledWith(
      '/api/v1/organizations/invitations/tok123/accept',
    )
    expect(member).toEqual({ id: 'm1', role: 'member' })
  })
})
