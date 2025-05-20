import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';
import { ErrorCode } from '../constants';

@ValidatorConstraint({ name: '_min', async: false })
export class MinConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const minValue = args.constraints[0] as number;
    return typeof value === 'number' && !isNaN(value) && value >= minValue;
  }

  defaultMessage(args: ValidationArguments) {
    const [minValue, errorCode] = args.constraints as [number, ErrorCode];

    return JSON.stringify({
      code: errorCode,
      message: `${args.property} must not be less than ${minValue}`,
      path: args.property,
    });
  }
}

export function Min(
  minValue: number,
  errorCode: ErrorCode = ErrorCode.INVALID_INPUT,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: '_min',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [minValue, errorCode],
      validator: MinConstraint,
    });
  };
}
