import { ErrorCode } from '@keepcloud/commons/constants';
import { NotFoundException, ConflictException } from './http.exceptions';

export class UserNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(ErrorCode.USER_NOT_FOUND, `User with ID '${id}' was not found`);
  }
}

export class EmailAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super(
      ErrorCode.EMAIL_ALREADY_EXISTS,
      `User with email '${email}' already exists`,
    );
  }
}
