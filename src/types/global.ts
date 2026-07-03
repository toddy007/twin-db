import { SqliteStorage } from "../storages/SqliteStorage";

export type SumOrSub = 'sum' | 'sub';

export interface DefaultOptionType {
  storage: typeof SqliteStorage;
}

export type TwinDBOptions = DefaultOptionType;
