export interface Storage {
  get(): object;
  set(value: string): unknown;
}
