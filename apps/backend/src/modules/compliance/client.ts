import { ApiResponse } from "shared";

export interface IIdentityClient {
  isPropertyAdmin(propertyId: string, userId: string): ApiResponse<boolean>;
}
