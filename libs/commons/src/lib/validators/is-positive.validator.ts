import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isNumber,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';
import { ErrorCode } from '../constants';

@ValidatorConstraint({ name: '_isPositive', async: false })
export class IsPositiveConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    return (
      isNumber(value, { allowNaN: false, allowInfinity: false }) && value > 0
    );
  }

  defaultMessage(args: ValidationArguments) {
    const errorCode = args.constraints[0];

    return JSON.stringify({
      code: errorCode,
      message: `${args.property} must be a positive number`,
      path: args.property,
    });
  }
}

export function IsPositive(
  errorCode: ErrorCode = ErrorCode.INVALID_INPUT,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: '_isPositive',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [errorCode],
      validator: IsPositiveConstraint,
    });
  };
}
