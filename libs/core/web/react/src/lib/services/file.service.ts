import {
  CreateFileDto,
  FileMinViewDto,
  CreatePresignedPostBody,
  PresignedPostResultDto,
} from '@keepcloud/commons/dtos';
import { BaseHttpService } from './base.service';

class FileService extends BaseHttpService {
  protected baseUrl: string = 'files';

  create(dto: CreateFileDto) {
    return this.post<FileMinViewDto, CreateFileDto>('', dto);
  }

  getPresignedPost(dto: CreatePresignedPostBody) {
    return this.post<PresignedPostResultDto, CreatePresignedPostBody>(
      '/presigned-post',
      dto,
    );
  }

  getPresignedGet(fileId: string) {
    return this.post<string>('/presigned-get', { fileId });
  }

  presignedGet(fileId: string) {
    return this.get<string>(`${fileId}/presigned-get`);
  }
}

export default new FileService();
