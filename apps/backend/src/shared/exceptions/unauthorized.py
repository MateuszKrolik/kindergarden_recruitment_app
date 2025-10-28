from src.shared.exceptions.domain import DomainException


class UnauthorizedException(DomainException):
    def __init__(self, message="Unathorized"):
        super().__init__(401, message)
