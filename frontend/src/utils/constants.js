export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

export const ATTENDANCE_STATUS = {
  CHECKED_IN: 'checked_in',
  COMPLETED: 'completed',
  ABSENT: 'absent',
};

export const FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

export const MAX_FILE_SIZES = {
  PROFILE_IMAGE: 2 * 1024 * 1024, // 2MB
  DOCUMENT: 5 * 1024 * 1024, // 5MB
};

export const DATE_FORMATS = {
  DISPLAY_DATE: 'dd MMM yyyy',
  DISPLAY_TIME: 'hh:mm a',
  DISPLAY_DATETIME: 'dd MMM yyyy, hh:mm a',
  API_DATE: 'yyyy-MM-dd',
  API_TIME: 'HH:mm:ss',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100],
};