export interface BaseFileService {
  rename(id: string, name: string): Promise<unknown>;
  delete(id: string): Promise<unknown>;
  restore(id: string): Promise<unknown>;
  move(id: string, dto: unknown): Promise<unknown>;
}
