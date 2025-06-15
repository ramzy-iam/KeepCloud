export interface Processor {
  execute(data?: unknown): Promise<unknown>;
}

export interface UpdateFileTagInStorageData {
  ownerId: string;
  sourcePath: string;
  fileId: string;
}

export interface DeleteNodeData {
  ownerId: string;
  nodeId: string;
}
export interface MoveNodeData {
  ownerId: string;
  nodeId: string;
  newParentId: string;
}

export interface DeleteFileFromStorageData {
  ownerId: string;
  fileId: string;
  storagePath: string;
}

export interface RebuildTreeData {
  userId: string;
}
