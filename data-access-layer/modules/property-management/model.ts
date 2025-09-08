import { DocumentType } from "../../shared/types/reporting";

export type Property = {
  id: string;
  name: string;
  slug: string;
};

export enum PropertyUserRole {
  Admin = "admin",
  Parent = "parent",
}

export type PropertyUser = {
  property_id: string;
  user_id: string;
  role: PropertyUserRole;
};

export enum RequirementType {
  Always = "always",
  Conditional = "conditional",
}

export enum ConditionKey {
  IsEmployed = "is_employed",
  IsSelfEmployed = "is_self_employed",
  IsStudent = "is_student",
  FiledTaxInDesiredLocation = "filed_tax_in_desired_location",
  ResidesInDesiredLocation = "resides_in_desired_location",
}

export type PropertyParentDocumentRequirement = {
  property_id: string;
  document_type: DocumentType;
  requirement_type: RequirementType;
  condition_key: ConditionKey;
  point_value: number;
};
