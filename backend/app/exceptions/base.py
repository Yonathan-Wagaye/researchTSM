# Base exception for all TSM exceptions
class TSMException(Exception):
    status_code: int = 500
    error_code: str = "internal_error"
    message: str = "An unexpected error occurred"

    def __init__(self, message: str | None = None):
        self.message = message or self.message
        super().__init__(self.message)
