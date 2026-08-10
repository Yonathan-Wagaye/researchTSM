type ValidationError = {
  loc?: Array<string | number>;
  msg?: string;
};

type ErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
  detail?: string | ValidationError[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const validationMessage = (errors: ValidationError[]) => {
  const messages = errors
    .map((error) => error.msg?.replace(/^Value error,\s*/i, ""))
    .filter((message): message is string => Boolean(message));

  return [...new Set(messages)].join(" ");
};

const errorMessage = (payload: ErrorPayload | null, status: number) => {
  const detail = payload?.detail;

  if (payload?.error?.message) {
    return payload.error.message;
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const message = validationMessage(detail);
    if (message) return message;
  }

  if (status >= 500) return "The server encountered an error. Please try again.";
  return "The request could not be completed. Please check your information.";
};

const apiClient = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new ApiError(
      "The API URL is not configured.",
      0,
      "configuration_error",
    );
  }

  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      "Unable to connect to the server. Please try again.",
      0,
      "network_error",
    );
  }

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | ErrorPayload
      | null;
    throw new ApiError(
      errorMessage(errorPayload, response.status),
      response.status,
      errorPayload?.error?.code ?? "request_failed",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json().catch(() => null)) as T;
}

export default apiClient;