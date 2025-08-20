export interface SharedFileModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  fileId: string;
  sharedWithId: string;
  permission: string;
}