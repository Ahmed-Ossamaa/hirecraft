export const getApiError = (error: unknown, defaultMessage = 'An unexpected error occurred. Please try again.'): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const apiError = error as any;
    if (apiError.response?.data?.message) {
      const message = apiError.response.data.message;
      return Array.isArray(message) ? message[0] : message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return defaultMessage;
};
