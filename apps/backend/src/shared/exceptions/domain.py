class DomainException(Exception):
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message
        super().__init__(message)

    def __str__(self):
        return f"[{type(self).__name__}] ({self.code}) {self.message}"
