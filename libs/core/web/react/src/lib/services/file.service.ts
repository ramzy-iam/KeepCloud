import {
  CreateFileDto,
  FileMinViewDto,
  CreatePresignedPostBody,
  PresignedPostResultDto,
  PresignedGetResultDto,
} from '@keepcloud/commons/dtos';
import { BaseHttpService } from './base.service';

class FileService extends BaseHttpService {
  protected baseUrl = 'files';

  create(dto: CreateFileDto) {
    return this.post<FileMinViewDto, CreateFileDto>('', dto);
  }

  getPresignedPost(dto: CreatePresignedPostBody) {
    return this.post<PresignedPostResultDto, CreatePresignedPostBody>(
      '/presigned-post',
      dto,
    );
  }

  generatePresignedGet(fileId: string) {
    return this.get<PresignedGetResultDto>(`/${fileId}/presigned-get`);
  }
}

export default new FileService();
