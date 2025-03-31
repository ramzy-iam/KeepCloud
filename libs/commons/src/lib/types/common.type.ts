export type OrderType = 'ASC' | 'DESC';
export type FilterByOperator = 'AND' | 'OR';
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};
