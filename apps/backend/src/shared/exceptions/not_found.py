from src.shared.exceptions.domain import DomainException


class NotFoundException(DomainException):
    def __init__(self, message="Resource not found"):
        super().__init__(404, message)
