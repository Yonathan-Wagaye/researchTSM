from app.exceptions.base import TSMException


class PhraseNotFoundException(TSMException):
    status_code: int = 404
    error_code: str = "phrase_not_found"
    message: str = "Phrase not found"


class PhraseAccessDeniedException(TSMException):
    status_code: int = 403
    error_code: str = "phrase_access_denied"
    message: str = "You are not authorized to access this phrase"


class PhraseAlreadyExistsException(TSMException):
    status_code: int = 409
    error_code: str = "phrase_already_exists"
    message: str = "A phrase with this key already exists in the project"


class PhraseUpdateErrorException(TSMException):
    status_code: int = 500
    error_code: str = "phrase_update_error"
    message: str = "An error occurred while updating phrase details"


class PhrasePaginationErrorException(TSMException):
    status_code: int = 500
    error_code: str = "phrase_pagination_error"
    message: str = "An error occurred while fetching phrases"


class InvalidPhraseFileException(TSMException):
    status_code: int = 400
    error_code: str = "invalid_phrase_file"
    message: str = "The phrase file could not be read"


class PhraseUploadNotFoundException(TSMException):
    status_code: int = 404
    error_code: str = "phrase_upload_not_found"
    message: str = "No pending phrase upload was found for this project"
