import {
  consumePendingInviteToken,
  parseInviteToken,
  setPendingInviteToken,
} from '@/navigation/deepLink'

describe('parseInviteToken', () => {
  it('extracts the token from scheme and https URLs', () => {
    expect(parseInviteToken('eventpulse://invitations/abc123/accept')).toBe(
      'abc123',
    )
    expect(
      parseInviteToken('https://eventpulse.app/invitations/tok-9/accept'),
    ).toBe('tok-9')
  })

  it('ignores query/hash and decodes the token', () => {
    expect(
      parseInviteToken('eventpulse://invitations/a%2Fb/accept?ref=email'),
    ).toBe('a/b')
  })

  it('returns null for non-invite or empty URLs', () => {
    expect(parseInviteToken(null)).toBeNull()
    expect(parseInviteToken('eventpulse://home')).toBeNull()
    expect(parseInviteToken('eventpulse://organizations/o1')).toBeNull()
  })
})

describe('pending invite token holder', () => {
  it('consumes the token once', () => {
    setPendingInviteToken('t1')
    expect(consumePendingInviteToken()).toBe('t1')
    // Second read is empty — consume-once.
    expect(consumePendingInviteToken()).toBeNull()
  })
})
