import { ErrorCode } from '@keepcloud/commons/constants';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from './http.exceptions';

export class UserNotFoundException extends NotFoundException {
  constructor(id: string) {
    super({
      code: ErrorCode.USER_NOT_FOUND,
      message: `User with ID '${id}' was not found`,
    });
  }
}

export class EmailAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super({
      code: ErrorCode.EMAIL_ALREADY_EXISTS,
      message: `User with email '${email}' already exists`,
    });
  }
}

export class FolderTrashedException extends ConflictException {
  constructor() {
    super({
      code: ErrorCode.FOLDER_TRASHED,
      message: `The folder is trashed and cannot be accessed.`,
      parentCode: ErrorCode.RESOURCE_TRASHED,
    });
  }
}

export class FileTrashedException extends ConflictException {
  constructor() {
    super({
      code: ErrorCode.FILE_TRASHED,
      message: `The file is trashed and cannot be accessed.`,
      parentCode: ErrorCode.RESOURCE_TRASHED,
    });
  }
}

export class ParentFolderTrashedException extends ConflictException {
  constructor() {
    super({
      code: ErrorCode.PARENT_FOLDER_TRASHED,
      message: `A parent folder is trashed and blocks access.`,
      parentCode: ErrorCode.RESOURCE_TRASHED,
    });
  }
}

export class FileNotFoundException extends NotFoundException {
  constructor(id: string) {
    super({
      code: ErrorCode.FILE_NOT_FOUND,
      message: `File with ID '${id}' was not found`,
      parentCode: ErrorCode.RESOURCE_NOT_FOUND,
    });
  }
}

export class FolderNotFoundException extends NotFoundException {
  constructor(id: string) {
    super({
      code: ErrorCode.FOLDER_NOT_FOUND,
      message: `Folder with ID '${id}' was not found`,
      parentCode: ErrorCode.RESOURCE_NOT_FOUND,
    });
  }
}

export class InsufficientStorageException extends BadRequestException {
  constructor() {
    super({
      code: ErrorCode.INSUFFICIENT_STORAGE,
      message: `Insufficient storage space available.`,
    });
  }
}

export class FileKeyInvalidException extends BadRequestException {
  constructor(storagePath: string) {
    super({
      code: ErrorCode.FILE_KEY_INVALID,
      message: `File with storage path '${storagePath}' does not exist.`,
    });
  }
}
