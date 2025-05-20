import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';
import { ErrorCode } from '../constants';

@ValidatorConstraint({ name: '_ArrayNotEmpty', async: false })
export class ArrayNotEmptyConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return Array.isArray(value) && value.length > 0;
  }

  defaultMessage(args: ValidationArguments) {
    const [errorCode] = args.constraints;
    return JSON.stringify({
      code: errorCode,
      message: `${args.property} must be a non-empty array`,
      path: args.property,
    });
  }
}

export function ArrayNotEmpty(
  errorCode: ErrorCode = ErrorCode.INVALID_INPUT,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: '_arrayNotEmpty',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [errorCode],
      validator: ArrayNotEmptyConstraint,
    });
  };
}
