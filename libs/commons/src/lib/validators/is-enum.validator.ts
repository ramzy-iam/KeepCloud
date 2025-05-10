import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isEnum,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';
import { ErrorCode } from '../constants';

@ValidatorConstraint({ name: 'isEnum', async: false })
export class IsEnumConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const [enumType] = args.constraints;
    return isEnum(value, enumType);
  }

  defaultMessage(args: ValidationArguments) {
    const [, errorCode] = args.constraints;

    return JSON.stringify({
      code: errorCode,
      message: `${args.property} must be a valid enum value`,
      path: args.property,
    });
  }
}

export function IsEnum(
  enumType: unknown,
  errorCode: ErrorCode = ErrorCode.INVALID_INPUT,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEnum',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [enumType, errorCode],
      validator: IsEnumConstraint,
    });
  };
}
