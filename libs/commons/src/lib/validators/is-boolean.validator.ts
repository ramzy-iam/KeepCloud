import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';
import { ErrorCode } from '../constants';

@ValidatorConstraint({ name: '_isBoolean', async: false })
export class IsBooleanConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    return typeof value === 'boolean';
  }

  defaultMessage(args: ValidationArguments) {
    const [errorCode] = args.constraints;
    return JSON.stringify({
      code: errorCode,
      message: `${args.property} must be a valid boolean`,
      path: args.property,
    });
  }
}

export function IsBoolean(
  errorCode: ErrorCode = ErrorCode.INVALID_BOOLEAN,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: '_isBoolean',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [errorCode],
      validator: IsBooleanConstraint,
    });
  };
}
