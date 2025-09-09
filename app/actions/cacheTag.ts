export function getAllDocumentApprovalRequestsForGivenPropertyParentCacheTag(
  propertyId: string,
  userId: string,
): string {
  return `properties:${propertyId}:parents:${userId}:approvals`;
}

export function getAllDocumentApprovalRequestsForGivenPropertyCacheTag(
  propertyId: string,
): string {
  return `properties:${propertyId}:parents:approvals`;
}

export function getPropertyParentDocumentApprovalRequestCacheTag(
  propertyId: string,
  userId: string,
  parentDocId: string,
) {
  return `properties:${propertyId}:parents:${userId}:approvals:${parentDocId}`;
}
