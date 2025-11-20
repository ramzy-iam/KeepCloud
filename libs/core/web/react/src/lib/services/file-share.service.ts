import {
  ShareFileDto,
  ShareFilePublicDto,
  UpdateFilePermissionDto,
  FilePermissionDto,
} from '@keepcloud/commons/dtos';
import { BaseHttpService } from './base.service';

class FileShareService extends BaseHttpService {
  protected baseUrl = 'files';

  shareFilePublic(fileId: string, dto: ShareFilePublicDto): Promise<void> {
    return this.post<void>(`/${fileId}/share/public`, dto);
  }

  shareFile(fileId: string, dto: ShareFileDto): Promise<void> {
    return this.post<void>(`/${fileId}/share`, dto);
  }

  unshareFilePublic(fileId: string): Promise<void> {
    return this.delete<void>(`/${fileId}/public-share`);
  }

  revokePermission(fileId: string, permissionId: string): Promise<void> {
    return this.delete<void>(`/${fileId}/permission/${permissionId}`);
  }

  updatePermissionRole(
    fileId: string,
    permissionId: string,
    dto: UpdateFilePermissionDto,
  ): Promise<void> {
    return this.put<void>(`/${fileId}/permissions/${permissionId}`, dto);
  }

  getPermissions(fileId: string) {
    return this.get<FilePermissionDto[]>(`/${fileId}/permissions`);
  }

  removeCollaborator(fileId: string, userId: string): Promise<void> {
    return this.delete<void>(`/${fileId}/permissions/${userId}`);
  }
}

export default new FileShareService();
