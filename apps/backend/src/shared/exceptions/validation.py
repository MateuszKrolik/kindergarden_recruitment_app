from src.shared.exceptions.domain import DomainException


class ValidationException(DomainException):
    def __init__(self, message="Validation failed"):
        super().__init__(400, message)
