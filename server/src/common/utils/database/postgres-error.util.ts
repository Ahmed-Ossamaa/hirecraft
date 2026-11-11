import { QueryFailedError } from 'typeorm';

interface PostgresErrorDetails {
  code: string | null;
  constraint: string | null;
}

/**
 * Extracts the details of a PostgreSQL error from a TypeORM QueryFailedError.
 * @param error - The error object to extract details from.
 * @returns An object containing the error code and constraint name, or null if not applicable.
 */
export function getPostgresErrorDetails(
  error: unknown,
): PostgresErrorDetails | null {
  if (!(error instanceof QueryFailedError)) {
    return null;
  }

  const driverError: unknown = error.driverError;

  if (typeof driverError !== 'object' || driverError === null) {
    return null;
  }

  const details = driverError as Record<string, unknown>;

  return {
    code: typeof details.code === 'string' ? details.code : null,
    constraint:
      typeof details.constraint === 'string' ? details.constraint : null,
  };
}
