import { ParentConditionKeys } from "../../shared/types/property_management";

export interface IIdentityClient {
  getParentConditionKeys(
    userId: string,
  ): Promise<{ data?: ParentConditionKeys; error?: Error }>;
}
