import { ErrorCode } from '@keepcloud/commons/constants';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from './http.exceptions';

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

export class FolderTrashedException extends ConflictException {
  constructor() {
    super(
      ErrorCode.FOLDER_TRASHED,
      `The folder is trashed and cannot be accessed.`,
      undefined,
      ErrorCode.RESOURCE_TRASHED,
    );
  }
}

export class FileTrashedException extends ConflictException {
  constructor() {
    super(
      ErrorCode.FILE_TRASHED,
      `The file is trashed and cannot be accessed.`,
      undefined,
      ErrorCode.RESOURCE_TRASHED,
    );
  }
}

export class ParentFolderTrashedException extends ConflictException {
  constructor() {
    super(
      ErrorCode.PARENT_FOLDER_TRASHED,
      `A parent folder is trashed and blocks access.`,
      undefined,
      ErrorCode.RESOURCE_TRASHED,
    );
  }
}

export class FileNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(
      ErrorCode.FILE_NOT_FOUND,
      `File with ID '${id}' was not found`,
      undefined,
      ErrorCode.RESOURCE_NOT_FOUND,
    );
  }
}

export class FolderNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(
      ErrorCode.FOLDER_NOT_FOUND,
      `Folder with ID '${id}' was not found`,
      undefined,
      ErrorCode.RESOURCE_NOT_FOUND,
    );
  }
}

export class InsufficientStorageException extends BadRequestException {
  constructor() {
    super(
      ErrorCode.INSUFFICIENT_STORAGE,
      `Insufficient storage space available.`,
      undefined,
    );
  }
}

export class FileKeyInvalidException extends BadRequestException {
  constructor(storagePath: string) {
    super(
      ErrorCode.FILE_KEY_INVALID,
      `File with storage path '${storagePath}' does not exist.`,
      undefined,
    );
  }
}
