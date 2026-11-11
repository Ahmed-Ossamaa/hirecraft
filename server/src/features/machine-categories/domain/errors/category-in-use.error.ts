/**
 * Custom error class to represent a situation
 * where a category is currently in use and cannot be deleted.
 * - (A Category is used by a machine or job posting)
 */
export class CategoryInUseError extends Error {
  constructor() {
    super('Cannot delete a category that is currently in use.');
    this.name = 'CategoryInUseError';
  }
}
