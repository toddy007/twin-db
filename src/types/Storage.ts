export interface Storage {
  get(path: string): unknown;
  set(path: string): unknown;
}
