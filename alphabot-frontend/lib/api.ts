const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";
  
export class APIError extends Error {
  status: number;
  data: any;

  constructor(
    message: string,
    status: number,
    data: any = null
  ) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new APIError(
      "AlphaBot can't connect to the server. Check your connection and try again.",
      0
    );
  }

  const contentType =
    response.headers.get("content-type") || "";

  let data: any = null;

  /*
   * Django should return JSON for our API endpoints.
   * If something unexpected such as an HTML error page
   * comes back, convert it into a friendly API error.
   */
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      throw new APIError(
        "AlphaBot received an invalid response. Please try again.",
        response.status
      );
    }
  } else {
    try {
      await response.text();
    } catch {
      // Ignore body-reading failures.
    }

    if (response.status === 401 || response.status === 403) {
      throw new APIError(
        "Please log in to continue.",
        response.status
      );
    }

    if (response.status === 404) {
      throw new APIError(
        "The requested AlphaBot feature could not be found.",
        404
      );
    }

    if (response.status >= 500) {
      throw new APIError(
        "Something went wrong on AlphaBot's side. Please try again in a moment.",
        response.status
      );
    }

    throw new APIError(
      "AlphaBot returned an unexpected response. Please try again.",
      response.status
    );
  }

  if (!response.ok) {
    let message =
      data?.error ||
      data?.detail ||
      data?.message ||
      "";

    switch (response.status) {
      case 400:
        message =
          data?.error ||
          data?.detail ||
          data?.message ||
          "Something about your request wasn't accepted. Check your input and try again.";
        break;

      case 401:
      case 403:
        message = "Please log in to continue.";
        break;

      case 404:
        message =
          "The requested AlphaBot feature could not be found.";
        break;

      case 429:
        message =
          data?.error ||
          data?.detail ||
          "You've reached your daily AI limit. Please try again tomorrow.";
        break;

      default:
        if (response.status >= 500) {
          message =
            "Something went wrong on AlphaBot's side. Please try again in a moment.";
        } else if (!message) {
          message = "Something went wrong. Please try again.";
        }
    }

    throw new APIError(
      message,
      response.status,
      data
    );
  }

  return data;
}

export { API_URL };