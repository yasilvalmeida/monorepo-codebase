export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  GUEST = 'GUEST',
}

export const RoleHierarchy = {
  [Role.SUPER_ADMIN]: [Role.ADMIN, Role.MANAGER, Role.USER, Role.GUEST],
  [Role.ADMIN]: [Role.MANAGER, Role.USER, Role.GUEST],
  [Role.MANAGER]: [Role.USER, Role.GUEST],
  [Role.USER]: [Role.GUEST],
  [Role.GUEST]: [],
};
