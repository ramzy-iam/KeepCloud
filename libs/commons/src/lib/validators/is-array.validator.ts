import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';
import { ErrorCode } from '../constants';

@ValidatorConstraint({ name: '_isArray', async: false })
export class IsArrayConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return Array.isArray(value);
  }

  defaultMessage(args: ValidationArguments) {
    const [errorCode] = args.constraints;
    return JSON.stringify({
      code: errorCode,
      message: `${args.property} must be an array`,
      path: args.property,
    });
  }
}

export function IsArray(
  errorCode: ErrorCode = ErrorCode.INVALID_INPUT,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: '_isArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [errorCode],
      validator: IsArrayConstraint,
    });
  };
}
