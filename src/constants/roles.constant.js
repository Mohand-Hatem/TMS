// File: src/constants/roles.constant.js
// What this does: Centralizes application user role definitions as reusable standard constant objects and arrays to eliminate magic strings.
// Used by: User.js model schema, auth.controller.js during registration, and authorization checks in controllers/routes.

export const ROLES = {
  ADMIN: 'Admin',
  MEMBER: 'Member'
};

export const ROLES_LIST = Object.values(ROLES); // ['Admin', 'Member']

export default { ROLES, ROLES_LIST };
