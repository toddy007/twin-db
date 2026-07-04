import { SqliteStorage } from "../storages/SqliteStorage.js";
import { JSONStorage } from "../storages/JSONStorage.js";

export type SumOrSub = 'sum' | 'sub';

export type StorageType = typeof SqliteStorage | typeof JSONStorage;

export type StorageInstanceType = SqliteStorage | JSONStorage;

export interface DefaultOptionType {
  cached: boolean;
  storage: StorageType;
}

export type TwinDBOptions = DefaultOptionType;
