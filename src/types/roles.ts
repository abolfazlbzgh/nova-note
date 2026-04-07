export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  USER = 'USER',
}

export enum Permission {}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [],

  [Role.USER]: [],
};
