
export const APP_CONFIG = {
  NAME: 'Hotel House of Vienna',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@hotelvienna.com',
};

export const COLORS = {
  VIENNA_BLUE: '#1E3A5F',
  VIENNA_GOLD: '#D4A59A',
  VIENNA_GRAY: '#B8C5B8',
};

export const ROUTES = {
  AUTH: {
    LOGIN: '/(auth)/login',
    REGISTER: '/(auth)/register',
  },
  TABS: {
    HOME: '/(tabs)/(home)',
    SCHEDULE: '/(tabs)/schedule',
    TIME_TRACKING: '/(tabs)/time-tracking',
    AVAILABILITY: '/(tabs)/availability',
    NOTIFICATIONS: '/(tabs)/notifications',
    PROFILE: '/(tabs)/profile',
    REPORTS: '/(tabs)/reports',
    ADMIN: '/(tabs)/admin',
  },
};

export const NOTIFICATION_TYPES = {
  SHIFT_CHANGE: 'shift_change',
  REMINDER: 'reminder',
  APPROVAL: 'approval',
  INFO: 'info',
  WARNING: 'warning',
} as const;

export const SHIFT_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
} as const;

export const EMPLOYEE_CATEGORIES = {
  BREAKFAST: 'breakfast',
  HOUSEKEEPING: 'housekeeping',
  FRONT_DESK: 'frontdesk',
} as const;

export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_TIME: 'HH:mm',
  FULL_DATETIME: 'MMM DD, YYYY HH:mm',
};

export const STORAGE_KEYS = {
  USER: '@user',
  SHIFTS: '@shifts',
  TIME_ENTRIES: '@time_entries',
  LEAVE_REQUESTS: '@leave_requests',
  IS_AUTHENTICATED: '@is_authenticated',
  SHIFT_REQUESTS: '@shift_requests',
  AVAILABILITY: '@availability',
  NOTIFICATIONS: '@notifications',
  MONTHLY_REPORTS: '@monthly_reports',
  PUSH_TOKEN: '@push_token',
} as const;
