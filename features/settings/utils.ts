import { User, UserProfile } from "../auth/types";
import { BackendProfile } from "../users/types";
import { DeviceNotificationPreferences } from "../notifications/types";
import { getUserAvatarUrl } from "../../utils/user";
import {
  FormattedSettingsUser,
  IndividualNotificationPreferences,
} from "./types";

/**
 * Formats user and profile details for display in the Settings user profile card.
 */
export function formatSettingsUserProfile(
  currentUser?: User | null,
  activeProfile?: UserProfile | BackendProfile | null
): FormattedSettingsUser | null {
  if (!currentUser) {
    return null;
  }

  const fallbackUsername = currentUser.email?.split("@")[0] || "user";
  const displayUsername = activeProfile?.username?.trim() || fallbackUsername;

  return {
    name: currentUser.name,
    username: displayUsername,
    email: currentUser.email,
    avatarUrl: getUserAvatarUrl(currentUser) || undefined,
  };
}

/**
 * Calculates the individual notification toggle values when the master push switch changes.
 * Disables all toggles if master is off, or restores previous category preferences if master is on.
 */
export function resolveNotificationTogglesOnMasterSwitch(
  isMasterPushEnabled: boolean,
  previousCategoryPreferences: IndividualNotificationPreferences
): IndividualNotificationPreferences {
  if (!isMasterPushEnabled) {
    return {
      likes: false,
      comments: false,
      mentions: false,
      reposts: false,
      followers: false,
    };
  }

  return { ...previousCategoryPreferences };
}

/**
 * Assembles a complete DeviceNotificationPreferences object ready for local device persistence.
 */
export function createDeviceNotificationPreferences(
  isMasterPushEnabled: boolean,
  categoryPreferences: IndividualNotificationPreferences
): DeviceNotificationPreferences {
  return {
    pushNotifications: isMasterPushEnabled,
    likes: categoryPreferences.likes,
    comments: categoryPreferences.comments,
    mentions: categoryPreferences.mentions,
    reposts: categoryPreferences.reposts,
    followers: categoryPreferences.followers,
  };
}

/**
 * Immutably produces an updated User entity with merged profile changes for Redux state updates.
 */
export function updateUserProfileState(
  currentUser: User,
  activeProfile?: UserProfile | null,
  updatedProfileFields?: Partial<UserProfile> | null
): User {
  return {
    ...currentUser,
    profile: {
      ...activeProfile,
      ...updatedProfileFields,
    },
  };
}
