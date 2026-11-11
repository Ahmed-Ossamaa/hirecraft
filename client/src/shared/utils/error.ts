const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// Return the first non-empty string.
const getMessage = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value.trim() ? value.trim() : undefined;
  }

  if (Array.isArray(value)) {
    return value.find(
      (message): message is string =>
        typeof message === "string" && Boolean(message.trim()),
    )?.trim();
  }

  return undefined;
};

export const getApiError = (
  error: unknown,
  defaultMessage = "An unexpected error occurred. Please try again.",
): string => {
  if (isRecord(error)) {
    const response = isRecord(error.response) ? error.response : undefined;
    const responseData =
      response && isRecord(response.data) ? response.data : undefined;
    const responseMessage = responseData
      ? getMessage(responseData.message)
      : undefined;

    if (responseMessage) return responseMessage;

    const directMessage = getMessage(error.message);
    if (directMessage) return directMessage;
  }

  return defaultMessage;
};
