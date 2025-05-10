import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isEnum,
  ValidatorConstraintInterface,
  ValidatorConstraint,
  isNumber,
} from 'class-validator';
import { ErrorCode } from '../constants';

@ValidatorConstraint({ name: '_isNumber', async: false })
export class IsNumberConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    return isNumber(value, { allowNaN: false, allowInfinity: false });
  }

  defaultMessage(args: ValidationArguments) {
    const [errorCode] = args.constraints;
    return JSON.stringify({
      code: errorCode,
      message: `${args.property} must be a valid number`,
      path: args.property,
    });
  }
}

export function IsNumber(
  errorCode: ErrorCode = ErrorCode.INVALID_NUMBER,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: '_isNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [errorCode],
      validator: IsNumberConstraint,
    });
  };
}
