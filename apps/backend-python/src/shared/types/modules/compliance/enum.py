from enum import StrEnum


class REQUEST_STATUS(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
