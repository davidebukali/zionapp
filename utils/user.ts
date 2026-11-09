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

/**
 * Resolves cover photo URL from a user or profile object if available.
 * Returns undefined if no cover URL is found.
 */
export function getUserCoverUrl(userOrProfile?: any): string | undefined {
  if (!userOrProfile) return undefined;

  // Direct cover on profile or nested under profile
  const cover = userOrProfile?.cover ?? userOrProfile?.profile?.cover;
  if (typeof cover === 'string' && cover.trim()) {
    return cover.trim();
  }
  if (cover?.url && typeof cover.url === 'string' && cover.url.trim()) {
    return cover.url.trim();
  }

  const coverUrl =
    userOrProfile?.cover_url ?? userOrProfile?.profile?.cover_url;
  if (typeof coverUrl === 'string' && coverUrl.trim()) {
    return coverUrl.trim();
  }

  return undefined;
}

const DEFAULT_AVATAR_PALETTE = [
  '#4E9B47', // Forest green
  '#7A9A32', // Olive
  '#8BA838', // Lime olive
  '#CF6B4E', // Terracotta
  '#D97742', // Amber brown
  '#3F72AF', // Slate blue
  '#8E44AD', // Purple
  '#2C3E50', // Charcoal
];

/**
 * Computes a deterministic background color for an avatar based on a seed identifier.
 */
export function getAvatarColor(
  identifier?: string | null,
  palette: string[] = DEFAULT_AVATAR_PALETTE
): string {
  if (!identifier || !identifier.trim()) {
    return palette[0];
  }

  let hashValue = 0;
  const cleanIdentifier = identifier.trim();
  for (let index = 0; index < cleanIdentifier.length; index += 1) {
    hashValue =
      cleanIdentifier.charCodeAt(index) + ((hashValue << 5) - hashValue);
    hashValue |= 0;
  }

  const paletteIndex = Math.abs(hashValue) % palette.length;
  return palette[paletteIndex];
}


