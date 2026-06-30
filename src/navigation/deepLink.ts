/**
 * Deep-link helpers for the invitation-accept flow.
 *
 * The AcceptInvitation screen lives under the authenticated `Main` tree, but an
 * invitation email is exactly the case where the recipient may be logged out.
 * We parse the token out of the incoming URL and, if the user isn't
 * authenticated yet, stash it so it can be replayed after they sign in.
 */

/** Extract the invitation token from a deep-link URL, or null if it isn't one. */
export function parseInviteToken(
  url: string | null | undefined,
): string | null {
  if (!url) return null
  // Match `.../invitations/<token>/accept` across scheme/host variants.
  const match = url.match(/invitations\/([^/?#]+)\/accept/)
  return match ? decodeURIComponent(match[1]) : null
}

// Module-level holder for a token captured while unauthenticated.
let pendingInviteToken: string | null = null

export function setPendingInviteToken(token: string | null) {
  pendingInviteToken = token
}

/** Read and clear the pending token (consume-once). */
export function consumePendingInviteToken(): string | null {
  const token = pendingInviteToken
  pendingInviteToken = null
  return token
}
