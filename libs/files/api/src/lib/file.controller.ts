import { Controller } from '@nestjs/common';
import { FileService } from '@keepcloud/core/services';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}
}
