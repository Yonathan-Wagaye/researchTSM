# Exception for when a user tries to register with an email that already exists
from app.exceptions.base import TSMException


class EmailAlreadyExistsException(TSMException):
    status_code: int = 409
    error_code: str = "email_already_exists"
    message: str = "An account with this email already exists"


# Exception for when a user tries to authenticate with invalid credentials
class InvalidCredentialsException(TSMException):
    status_code: int = 401
    error_code: str = "invalid_credentials"
    message: str = "Invalid email or password"


class InvalidAccessTokenException(TSMException):
    status_code: int = 401
    error_code: str = "invalid_access_token"
    message: str = "Invalid access token"


class ExpiredAccessTokenException(TSMException):
    status_code: int = 401
    error_code: str = "expired_access_token"
    message: str = "Access token has expired"


# Exception for when a refresh token has expired
class ExpiredRefreshTokenException(TSMException):
    status_code: int = 401
    error_code: str = "expired_refresh_token"
    message: str = "Refresh token has expired"


# Exception for when a refresh token is invalid
class InvalidRefreshTokenException(TSMException):
    status_code: int = 401
    error_code: str = "invalid_refresh_token"
    message: str = "Invalid refresh token"


# Exception for when a refresh token is missing
class MissingRefreshTokenException(TSMException):
    status_code: int = 401
    error_code: str = "missing_refresh_token"
    message: str = "Refresh token is required"
