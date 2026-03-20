export const Role = {
  OWNER: "OWNER",
  CHEF: "CHEF",
  CUSTOMER: "CUSTOMER"
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];