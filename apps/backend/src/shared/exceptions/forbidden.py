from src.shared.exceptions.domain import DomainException


class ForbiddenException(DomainException):
    def __init__(self, message="Insufficient permissions!"):
        super().__init__(403, message)
