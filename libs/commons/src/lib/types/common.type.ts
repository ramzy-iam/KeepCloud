export type SortOrder = 'asc' | 'desc';
export type FilterByOperator = 'AND' | 'OR';
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

export type ValueOf<T> = T[keyof T];
export type FolderViewMode = 'grid' | 'table';
export type DispositionType = 'inline' | 'attachment' | (string & {});

// Bulk action types
export type BulkAction = 'download' | 'trash' | 'delete' | 'restore';

// Action completion callback type
export type ActionCompleteCallback<T = unknown[]> = (
  action: BulkAction,
  items: T,
) => void;
