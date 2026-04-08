export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  USER = 'USER',
}

export enum Permission {
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  CREATE_NOTE = 'CREATE_NOTE',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_PROFILE = 'MANAGE_PROFILE',
}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [Permission.VIEW_DASHBOARD, Permission.MANAGE_USERS, Permission.MANAGE_PROFILE],
  [Role.USER]: [Permission.VIEW_DASHBOARD, Permission.CREATE_NOTE, Permission.MANAGE_PROFILE],
};
