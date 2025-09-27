import type { ChildDocumentType, DocumentType } from "./reporting.ts";

export type Property = {
  id: string;
  name: string;
  slug: string;
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

export const REQUIREMENT_TYPE = {
  Always: "always",
  Conditional: "conditional",
} as const satisfies Record<string, RequirementType>;

export type RequirementType = "always" | "conditional";

export const CONDITION_KEY = {
  IsEmployed: "is_employed",
  IsSelfEmployed: "is_self_employed",
  IsStudent: "is_student",
  FiledTaxInDesiredLocation: "filed_tax_in_desired_location",
  ResidesInDesiredLocation: "resides_in_desired_location",
} as const satisfies Record<string, ConditionKey>;

export type ConditionKey =
  | "is_employed"
  | "is_self_employed"
  | "is_student"
  | "filed_tax_in_desired_location"
  | "resides_in_desired_location";

export const CHILD_CONDITION_KEY = {
  HasDisability: "has_disability",
} as const satisfies Record<string, ChildConditionKey>;

export type ChildConditionKey = "has_disability"; // TODO

export type PropertyParentDocumentRequirement = {
  property_id: string;
  document_type: DocumentType;
  requirement_type: RequirementType;
  condition_key: ConditionKey;
  point_value: number;
};

export type PropertyChild = {
  property_id: string;
  child_id: string;
  points: number;
  approved: boolean;
};

export type PropertyChildDocumentRequirement = {
  property_id: string;
  document_type: ChildDocumentType;
  requirement_type: RequirementType;
  condition_key: ChildConditionKey;
  point_value: number;
};
