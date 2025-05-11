import { APP_API } from './axios';
import {
  CreateFolderDto,
  FolderFilterDto,
  PaginationDto,
  FileMinViewDto,
  FileDetailsDto,
  GetOneFolderQueryDto,
} from '@keepcloud/commons/dtos';

export class FolderService {
  static create(dto: CreateFolderDto) {
    return APP_API.post<FileMinViewDto>('folders', dto);
  }

  static getChildren(id: string, filters: FolderFilterDto) {
    return APP_API.get<PaginationDto<FileMinViewDto>>(
      `folders/${id}/children`,
      {
        params: filters,
      },
    );
  }

  static getOne(
    id: string,
    query: GetOneFolderQueryDto = { withAncestors: true },
  ) {
    return APP_API.get<FileDetailsDto>(`folders/${id}`, {
      params: query,
    });
  }
}
