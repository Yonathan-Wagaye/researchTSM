from app.exceptions.base import TSMException


class ProjectNotFoundException(TSMException):
    status_code: int = 404
    error_code: str = "project_not_found"
    message: str = "Project not found"


class ProjectAccessDeniedException(TSMException):
    status_code: int = 403
    error_code: str = "project_access_denied"
    message: str = "You are not authorized to access this project"


class ProjectPaginationErrorException(TSMException):
    status_code: int = 500
    error_code: str = "project_pagination_error"
    message: str = "An error occurred while fetching projects"


class ProjectUpdateErrorException(TSMException):
    status_code: int = 500
    error_code: str = "project_update_error"
    message: str = "An error occurred while updating project details"
