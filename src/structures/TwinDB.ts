import lodash from 'lodash';
import {
    SumOrSub,
    TwinDBOptions,
    StorageInstanceType,
} from '../types/global.js';
import { JSONStorage } from '../storages/JSONStorage.js';
import { SqliteStorage } from '../storages/SqliteStorage.js';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { pathErrorMessage } from '../utils/vars.js';

export class TwinDB {
    public cache: Record<string, unknown>;
    private storage: StorageInstanceType;

    public constructor(
        argPath: string = 'database/twin',
        options: TwinDBOptions = { storage: JSONStorage },
    ) {
        if (!argPath || typeof argPath !== 'string')
            throw new Error(pathErrorMessage);

        const solvedPath = path.resolve(process.cwd(), argPath);
        mkdirSync(path.dirname(solvedPath), { recursive: true });

        if (!options || typeof options !== 'object' || Array.isArray(options))
            options = { storage: JSONStorage };

        options.storage ||= JSONStorage;

        if (![JSONStorage, SqliteStorage].includes(options.storage))
            throw new Error('Invalid storage type passed in options');

        this.storage =
            options.storage === SqliteStorage
                // @ts-expect-error - table and key exists here
                ? new options.storage(solvedPath, options.table, options.key)
                : new options.storage(solvedPath);

        this.cache = this.storage.get();
    }

    private update(
        path: string /*user.info.name*/,
        value: unknown,
        fetch: boolean = false,
    ) {
        if (fetch) this.cache = this.storage.get();

        lodash.set(this.cache, path, value);

        this.storage.set(JSON.stringify(this.cache, null, 2));

        return this.cache;
    }

    public set(path: string, value: unknown, fetch: boolean = false) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (value === undefined)
            throw new Error('You must provide a value to update');

        return this.update(path, value, fetch);
    }

    public get<T = unknown>(path: string, fetch: boolean = false): T | null {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);

        if (fetch) this.cache = this.storage.get();

        return lodash.get(this.cache, path, null) as T | null;
    }

    public delete(path: string, fetch: boolean = false) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);

        if (fetch) this.cache = this.storage.get();

        const pathExists = this.get(path);
        if (pathExists === null)
            throw new Error('The path does not exists or its value is null');

        return this.update(path, null);
    }

    public remove(path: string, fetch: boolean = false) {
        return this.delete(path, fetch);
    };

    private sumOrSub(
        path: string,
        value: number,
        type: SumOrSub,
        fetch: boolean = false,
    ) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (!type || !['sum', 'sub'].includes(type))
            throw new Error('The type must be "sum" or "sub"');
        const isSum = type === 'sum';
        if (!value || typeof value !== 'number')
            throw new Error(
                `The value to ${isSum ? 'sum' : 'sub'} must be a number`,
            );

        if (fetch) this.cache = this.storage.get();

        let currentValue = (this.get(path) || 0) as unknown as number;
        if (typeof currentValue !== 'number') currentValue = 0;

        return this.update(
            path,
            isSum ? currentValue + value : currentValue - value,
        );
    }

    public sum(path: string, value: number, fetch: boolean = false) {
        return this.sumOrSub(path, value, 'sum', fetch);
    }

    public add(path: string, value: number, fetch: boolean = false) {
        return this.sum(path, value, fetch);
    }

    public sub(path: string, value: number, fetch: boolean = false) {
        return this.sumOrSub(path, value, 'sub', fetch);
    }

    public subtract(path: string, value: number, fetch: boolean = false) {
        return this.sub(path, value, fetch);
    }

    public concat(path: string, value: string, fetch: boolean = false) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (!value || typeof value !== 'string')
            throw new Error('You must provide a string value to update');

        if (fetch) this.cache = this.storage.get();

        const currentValue = this.get(path);
        if (typeof currentValue !== 'string')
            throw new Error(
                'The value to concat is not a string or the path does not exists',
            );

        return this.update(path, currentValue + value);
    }

    public push(path: string, values: unknown[], fetch: boolean = false) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (!values || values.length === 0)
            throw new Error('You must provide a value to update');

        if (fetch) this.cache = this.storage.get();

        let currentValue = (this.get(path) || []) as unknown as unknown[];
        if (!Array.isArray(currentValue)) currentValue = [];

        currentValue.push(...values);
        return this.update(path, currentValue);
    }

    public pull(path: string, values: unknown[], fetch: boolean = false) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (!values || values.length === 0)
            throw new Error('You must provide a value to update');

        if (fetch) this.cache = this.storage.get();

        const currentValue = this.get(path);
        if (!Array.isArray(currentValue))
            throw new Error(
                'The current value of this path is not an array or the path does not exists',
            );

        for (const value of values) {
            const index = currentValue.indexOf(value);
            if (index < 0) continue;

            currentValue.splice(index, 1);
        }

        return this.update(path, currentValue);
    }
}
