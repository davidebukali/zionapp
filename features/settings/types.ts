import { User, UserProfile } from "../auth/types";
import { BackendProfile } from "../users/types";

export interface FormattedSettingsUser {
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface IndividualNotificationPreferences {
  likes: boolean;
  comments: boolean;
  mentions: boolean;
  reposts: boolean;
  followers: boolean;
}
