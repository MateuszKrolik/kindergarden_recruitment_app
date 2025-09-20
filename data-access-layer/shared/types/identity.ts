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
