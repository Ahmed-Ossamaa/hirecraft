import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validator constraint ensuring that at least one property in the target DTO is provided.
 */
@ValidatorConstraint({ name: 'requireAtLeastOne', async: false })
export class RequireAtLeastOneConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const object = args.object;

    if (typeof object !== 'object' || object === null) {
      return false;
    }

    return Object.values(object).some((value) => value !== undefined);
  }

  defaultMessage(): string {
    return 'At least one property must be provided for update.';
  }
}

/**
 * Class decorator that validates a DTO has at least one non-undefined property.
 */
export function RequireAtLeastOne(
  validationOptions?: ValidationOptions,
): ClassDecorator {
  return (target) => {
    registerDecorator({
      name: 'requireAtLeastOne',
      target: target,
      propertyName: 'requireAtLeastOne',
      options: validationOptions,
      validator: RequireAtLeastOneConstraint,
    });
  };
}
