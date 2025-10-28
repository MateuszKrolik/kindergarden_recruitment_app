from src.shared.exceptions.domain import DomainException


class DatabaseException(DomainException):
    def __init__(self, message="Database operation failed!"):
        super().__init__(500, message)
