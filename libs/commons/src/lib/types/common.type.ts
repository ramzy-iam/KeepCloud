export type SortOrder = 'ASC' | 'DESC';
export type FilterByOperator = 'AND' | 'OR';
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

export type ValueOf<T> = T[keyof T];
