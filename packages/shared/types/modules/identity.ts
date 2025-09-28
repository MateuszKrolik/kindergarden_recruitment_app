export type ParentConditionKeys = {
  is_employed?: boolean;
  is_self_employed?: boolean;
  is_student?: boolean;
  filed_tax_in_desired_location?: boolean;
  resides_in_desired_location?: boolean;
};

export type ChildConditionKeys = {
  has_disability?: boolean;
};

export type ParentChild = {
  parent_id: string;
  child_id: string;
};

export const PROPERTY_USER_ROLE = {
  Admin: "admin",
  Parent: "parent",
} as const satisfies Record<string, PropertyUserRole>;

export type PropertyUserRole = "admin" | "parent";

export type PropertyUser = {
  property_id: string;
  user_id: string;
  role: PropertyUserRole;
};
