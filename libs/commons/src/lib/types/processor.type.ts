export interface Processor {
  execute(data?: unknown): Promise<unknown>;
}

export interface MoveFileInStorageData {
  ownerId: string;
  sourcePath: string;
  fileId: string;
  filename: string;
}
