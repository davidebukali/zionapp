import { getUserInitials, getUserAvatarUrl } from './user';

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
});

