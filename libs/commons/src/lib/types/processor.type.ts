export interface Processor {
  execute(data?: unknown): Promise<unknown>;
}

export interface UpdateFileTagInStorageData {
  treeOwnerId: string;
  sourcePath: string;
  fileId: string;
}

export interface DeleteNodeData {
  treeOwnerId: string;
  nodeId: string;
}
export interface MoveNodeData {
  treeOwnerId: string;
  nodeId: string;
  newParentId: string;
}

export interface DeleteFileFromStorageData {
  treeOwnerId: string;
  fileId: string;
  storagePath: string;
}

export interface DeleteFileAndChildrenFromStorageData {
  treeOwnerId: string;
  fileId: string;
}

export interface RebuildTreeData {
  userId: string;
}

export interface SendEmailData {
  senderEmail?: string;
  recipientEmail: string;
  subject: string;
  templateKey: string;
  data: Record<string, unknown>;
  attachments?: unknown[];
}
