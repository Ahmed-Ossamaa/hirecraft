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
    const object = args.object as Record<string, unknown>;
    const properties = args.constraints[0] as string[] | undefined;

    const values = properties
      ? properties.map((property) => object[property])
      : Object.values(object);

    return values.some(
      (value) => value !== undefined && value !== null && value !== '',
    );
  }

  defaultMessage(args: ValidationArguments): string {
    const properties = args.constraints[0] as string[] | undefined;

    return properties
      ? `At least one of the following properties must be provided: ${properties.join(', ')}.`
      : 'At least one property must be provided.';
  }
}

/**
 * Class decorator that validates a DTO has at least one (non-undefined| null | '') property.
 */
export function RequireAtLeastOne(
  propertiesOrOptions?: string[] | ValidationOptions,
  validationOptions?: ValidationOptions,
): ClassDecorator {
  const properties = Array.isArray(propertiesOrOptions)
    ? propertiesOrOptions
    : undefined;
  const options = Array.isArray(propertiesOrOptions)
    ? validationOptions
    : propertiesOrOptions;

  return (target) => {
    registerDecorator({
      name: 'requireAtLeastOne',
      target,
      propertyName: 'requireAtLeastOne',
      constraints: [properties],
      options,
      validator: RequireAtLeastOneConstraint,
    });
  };
}
