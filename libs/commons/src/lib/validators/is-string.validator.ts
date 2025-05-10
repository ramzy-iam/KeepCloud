import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';
import { ErrorCode } from '../constants';

@ValidatorConstraint({ name: 'isString', async: false })
export class IsStringConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    return typeof value === 'string';
  }

  defaultMessage(args: ValidationArguments) {
    const [errorCode] = args.constraints;
    return JSON.stringify({
      code: errorCode,
      message: `${args.property} must be a valid string`,
      path: args.property,
    });
  }
}

export function IsString(
  errorCode: ErrorCode = ErrorCode.INVALID_STRING,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [errorCode],
      validator: IsStringConstraint,
    });
  };
}
