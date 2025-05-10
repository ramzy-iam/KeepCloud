import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isNotEmpty,
  isString,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';
import { ErrorCode } from '../constants';

@ValidatorConstraint({ name: 'isNotEmpty', async: false })
export class IsNotEmptyConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    return isNotEmpty(value) && isString(value);
  }

  defaultMessage(args: ValidationArguments) {
    const [errorCode] = args.constraints;

    return JSON.stringify({
      code: errorCode,
      message: `${args.property} must be a non-empty string`,
      path: args.property,
    });
  }
}

export function IsNotEmpty(
  errorCode: ErrorCode = ErrorCode.INVALID_INPUT,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotEmpty',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [errorCode],
      validator: IsNotEmptyConstraint,
    });
  };
}
