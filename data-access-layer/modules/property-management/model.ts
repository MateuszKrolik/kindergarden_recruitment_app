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
