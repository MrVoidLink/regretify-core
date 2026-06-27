export const ADMIN_ROLE_SUPER_ADMIN = 'super_admin';
export const ADMIN_ROLE_AUTHOR = 'author';

export const ADMIN_USER_STATUS_ACTIVE = 'active';
export const ADMIN_USER_STATUS_INACTIVE = 'inactive';

export const ADMIN_ROLES = [ADMIN_ROLE_SUPER_ADMIN, ADMIN_ROLE_AUTHOR] as const;
export const ADMIN_USER_STATUSES = [
  ADMIN_USER_STATUS_ACTIVE,
  ADMIN_USER_STATUS_INACTIVE,
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
export type AdminUserStatus = (typeof ADMIN_USER_STATUSES)[number];

export function normalizeAdminRole(value?: string | null): AdminRole {
  const normalizedValue = value?.trim().toLowerCase();

  if (normalizedValue === ADMIN_ROLE_AUTHOR) {
    return ADMIN_ROLE_AUTHOR;
  }

  return ADMIN_ROLE_SUPER_ADMIN;
}

export function normalizeAdminStatus(value?: string | null): AdminUserStatus {
  const normalizedValue = value?.trim().toLowerCase();

  if (normalizedValue === ADMIN_USER_STATUS_INACTIVE) {
    return ADMIN_USER_STATUS_INACTIVE;
  }

  return ADMIN_USER_STATUS_ACTIVE;
}

export function getDefaultAuthorRoleForAdminRole(role?: string | null) {
  return normalizeAdminRole(role) === ADMIN_ROLE_SUPER_ADMIN
    ? 'Regretify platform administrator.'
    : 'Regretify market pulse editor.';
}
