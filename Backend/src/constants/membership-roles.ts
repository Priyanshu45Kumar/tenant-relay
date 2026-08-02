export const MEMBERSHIP_ROLES = [
  "owner",
  "admin",
  "developer",
  "viewer",
] as const;

export type MembershipRole =
  (typeof MEMBERSHIP_ROLES)[number];

export const isMembershipRole = (
  value: unknown,
): value is MembershipRole => {
  return (
    typeof value === "string" &&
    MEMBERSHIP_ROLES.some((role) => role === value)
  );
};