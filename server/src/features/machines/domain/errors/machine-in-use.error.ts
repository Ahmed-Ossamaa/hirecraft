/**
 * Custom error class to represent a situation
 * where a machine is currently in use and cannot be deleted.
 * - (A Machine is used by a job posting)
 */
export class MachineInUseError extends Error {
  constructor() {
    super('Cannot delete a machine that is currently in use.');
    this.name = 'MachineInUseError';
  }
}
