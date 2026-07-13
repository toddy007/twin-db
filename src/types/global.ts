import { SqliteStorage } from '../storages/SqliteStorage.js';
import { JSONStorage } from '../storages/JSONStorage.js';

export type SumOrSub = 'sum' | 'sub';

export type StorageType = typeof SqliteStorage | typeof JSONStorage;

export type StorageInstanceType = SqliteStorage | JSONStorage;

export interface DefaultOptions {
    storage: StorageType;
}

export interface SqliteStorageOptions {
    key?: string;
    table?: string;
    storage: typeof SqliteStorage;
}

export type TwinDBOptions = DefaultOptions | SqliteStorageOptions;

export interface DefaultSchemaType {
    _id: string;
    data: Record<string, unknown>;
}
