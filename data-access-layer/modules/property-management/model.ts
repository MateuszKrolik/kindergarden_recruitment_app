import type { DocumentType } from "../../shared/types/reporting.ts";

export type Property = {
  id: string;
  name: string;
  slug: string;
};

export const PROPERTY_USER_ROLE = {
  Admin: "admin",
  Parent: "parent",
} as const;

export type PropertyUserRole =
  (typeof PROPERTY_USER_ROLE)[keyof typeof PROPERTY_USER_ROLE];

export type PropertyUser = {
  property_id: string;
  user_id: string;
  role: PropertyUserRole;
};

export const REQUIREMENT_TYPE = {
  Always: "always",
  Conditional: "conditional",
} as const;

export type RequirementType =
  (typeof REQUIREMENT_TYPE)[keyof typeof REQUIREMENT_TYPE];

export const CONDITION_KEY = {
  IsEmployed: "is_employed",
  IsSelfEmployed: "is_self_employed",
  IsStudent: "is_student",
  FiledTaxInDesiredLocation: "filed_tax_in_desired_location",
  ResidesInDesiredLocation: "resides_in_desired_location",
} as const;

export type ConditionKey = (typeof CONDITION_KEY)[keyof typeof CONDITION_KEY];

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
