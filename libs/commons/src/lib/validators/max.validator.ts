import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';
import { ErrorCode } from '../constants';

@ValidatorConstraint({ name: '_max', async: false })
export class MaxConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const maxValue = args.constraints[0] as number;
    return typeof value === 'number' && !isNaN(value) && value <= maxValue;
  }

  defaultMessage(args: ValidationArguments) {
    const [maxValue, errorCode] = args.constraints as [number, ErrorCode];

    return JSON.stringify({
      code: errorCode,
      message: `${args.property} must not be greater than ${maxValue}`,
      path: args.property,
    });
  }
}
export function Max(
  maxValue: number,
  errorCode: ErrorCode = ErrorCode.INVALID_INPUT,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: '_max',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [maxValue, errorCode],
      validator: MaxConstraint,
    });
  };
}
