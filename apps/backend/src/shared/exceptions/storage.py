from src.shared.exceptions.domain import DomainException


class StorageException(DomainException):
    def __init__(self, message="Storage operation failed!"):
        super().__init__(500, message)
