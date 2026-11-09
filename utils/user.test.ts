import {
  getUserInitials,
  getUserAvatarUrl,
  getUserCoverUrl,
  getAvatarColor,
} from './user';

describe('utils/user', () => {
  describe('getUserInitials', () => {
    it('returns initials for two-word names', () => {
      expect(getUserInitials('Jane Doe')).toBe('JD');
      expect(getUserInitials('john smith')).toBe('JS');
      expect(getUserInitials(' Alice   Bob ')).toBe('AB');
    });

    it('returns first two letters of first two words for multi-word names', () => {
      expect(getUserInitials('John Fitzgerald Kennedy')).toBe('JF');
    });

    it('returns first two characters for single-word names', () => {
      expect(getUserInitials('Jane')).toBe('JA');
      expect(getUserInitials('o')).toBe('O');
    });

    it('falls back to email prefix when name is absent', () => {
      expect(getUserInitials(undefined, 'jane@example.com')).toBe('JA');
      expect(getUserInitials('', 'john.smith@domain.org')).toBe('JO');
      expect(getUserInitials(null, 'a@b.com')).toBe('A');
    });

    it('falls back to default fallback or custom fallback when both name and email are absent', () => {
      expect(getUserInitials()).toBe('AR');
      expect(getUserInitials(null, null)).toBe('AR');
      expect(getUserInitials('', '', 'M')).toBe('M');
    });
  });

  describe('getUserAvatarUrl', () => {
    it('extracts avatar url from nested profile avatar object', () => {
      const user = {
        profile: {
          avatar: { url: 'https://example.com/photo.jpg' },
        },
      };
      expect(getUserAvatarUrl(user)).toBe('https://example.com/photo.jpg');
    });

    it('extracts avatar url when avatar is a string', () => {
      const user = {
        profile: {
          avatar: 'https://example.com/photo2.jpg',
        },
      };
      expect(getUserAvatarUrl(user)).toBe('https://example.com/photo2.jpg');
    });

    it('extracts avatar url from profile.avatar_url', () => {
      const user = {
        profile: {
          avatar_url: 'https://example.com/photo3.jpg',
        },
      };
      expect(getUserAvatarUrl(user)).toBe('https://example.com/photo3.jpg');
    });

    it('returns undefined when no avatar is present', () => {
      expect(getUserAvatarUrl(undefined)).toBeUndefined();
      expect(getUserAvatarUrl({})).toBeUndefined();
      expect(getUserAvatarUrl({ profile: {} })).toBeUndefined();
      expect(getUserAvatarUrl({ profile: { avatar: null } })).toBeUndefined();
    });
  });

  describe('getUserCoverUrl', () => {
    it('extracts cover url from profile cover object', () => {
      const user = {
        profile: {
          cover: { url: 'https://example.com/cover.jpg' },
        },
      };
      expect(getUserCoverUrl(user)).toBe('https://example.com/cover.jpg');
    });

    it('extracts cover url from direct profile object', () => {
      const profile = {
        cover: { url: 'https://example.com/cover-direct.jpg' },
      };
      expect(getUserCoverUrl(profile)).toBe('https://example.com/cover-direct.jpg');
    });

    it('extracts cover when cover is a direct string', () => {
      const user = {
        profile: {
          cover: 'https://example.com/cover-str.jpg',
        },
      };
      expect(getUserCoverUrl(user)).toBe('https://example.com/cover-str.jpg');
    });

    it('extracts cover from cover_url field', () => {
      const profile = {
        cover_url: 'https://example.com/cover-fallback.jpg',
      };
      expect(getUserCoverUrl(profile)).toBe('https://example.com/cover-fallback.jpg');
    });

    it('returns undefined when no cover is present', () => {
      expect(getUserCoverUrl(undefined)).toBeUndefined();
      expect(getUserCoverUrl({})).toBeUndefined();
      expect(getUserCoverUrl({ profile: {} })).toBeUndefined();
      expect(getUserCoverUrl({ profile: { cover: null } })).toBeUndefined();
    });
  });

  describe('getAvatarColor', () => {
    it('returns first palette color when identifier is missing or empty', () => {
      const color = getAvatarColor();
      expect(color).toBe('#4E9B47');
      expect(getAvatarColor('')).toBe('#4E9B47');
      expect(getAvatarColor(null)).toBe('#4E9B47');
    });

    it('returns consistent deterministic color for same identifier', () => {
      const firstCall = getAvatarColor('user_123');
      const secondCall = getAvatarColor('user_123');
      expect(firstCall).toBe(secondCall);
    });

    it('supports custom palette', () => {
      const customPalette = ['#111111', '#222222', '#333333'];
      const color = getAvatarColor('jane', customPalette);
      expect(customPalette).toContain(color);
    });
  });
});

