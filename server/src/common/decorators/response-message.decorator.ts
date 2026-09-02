import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_METADATA = 'response_message';
/**
 * - Decorator to attach a custom response message to API endpoints.
 * - This message is included in the standardized API response format.
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_METADATA, message);
