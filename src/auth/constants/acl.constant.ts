export const ROLES = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  USER: 'USER',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  // User permissions
  INDEX_USER: 'index-user',
  SHOW_USER: 'show-user',
  STORE_USER: 'store-user',
  UPDATE_USER: 'update-user',
  DESTROY_USER: 'destroy-user',

  // Post permissions
  INDEX_POST: 'index-post',
  SHOW_POST: 'show-post',
  STORE_POST: 'store-post',
  UPDATE_POST: 'update-post',
  DESTROY_POST: 'destroy-post',
} as const;

export type PermissionType = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
