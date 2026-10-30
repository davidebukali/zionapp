/**
 * Computes uppercase initials from a user's display name or email.
 * - Multi-word name: first letters of the first two words (e.g. "Jane Doe" -> "JD")
 * - Single-word name: first two characters (e.g. "Jane" -> "JA")
 * - Email fallback: first two characters of email (e.g. "jane@example.com" -> "JA")
 * - Default fallback: fallback string (defaults to "AR")
 */
export function getUserInitials(
  name?: string | null,
  email?: string | null,
  fallback = 'AR'
): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  if (email && email.trim()) {
    const localPart = email.trim().split('@')[0] || email.trim();
    return localPart.slice(0, 2).toUpperCase();
  }

  return fallback;
}

/**
 * Resolves avatar image URL from a user profile object if available.
 * Returns undefined if no avatar URL is found, allowing components to fall back to initials.
 */
export function getUserAvatarUrl(user?: any): string | undefined {
  if (!user) return undefined;

  const avatar = user?.profile?.avatar;
  if (typeof avatar === 'string' && avatar.trim()) {
    return avatar.trim();
  }
  if (avatar?.url && typeof avatar.url === 'string' && avatar.url.trim()) {
    return avatar.url.trim();
  }
  if (
    user?.profile?.avatar_url &&
    typeof user.profile.avatar_url === 'string' &&
    user.profile.avatar_url.trim()
  ) {
    return user.profile.avatar_url.trim();
  }

  return undefined;
}

