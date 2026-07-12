import lodash from 'lodash';
import { SumOrSub, TwinDBOptions, StorageInstanceType } from '../types/global';
import { JSONStorage } from '../storages/JSONStorage';

const pathErrorMessage = 'The path must be a string or you dont provide a path';

export class TwinDB {
    public cache: Record<string, unknown>;
    public name: string;
    private storage: StorageInstanceType;

    public constructor(name: string = 'db', options?: TwinDBOptions) {
        this.name = name;

        const Storage = options?.storage ?? JSONStorage;
        this.storage = new Storage(name);

        this.cache = this.storage.get() as Record<string, unknown>;
    }

    private update(path: string /*user.info.name*/, value: unknown, fetch: boolean = false) {
        if (fetch) this.cache = this.storage.get() as Record<string, unknown>;

        lodash.set(this.cache, path, value);

        this.storage.set(JSON.stringify(this.cache));

        return this.cache;
    }

    public set(path: string, value: unknown, fetch: boolean = false) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (value === undefined)
            throw new Error('You must provide a value to update');

        return this.update(path, value, fetch);
    }

    public get(path: string, fetch: boolean = false): unknown | null {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);

        if (fetch) this.cache = this.storage.get() as Record<string, unknown>;

        return lodash.get(this.cache, path, null);
    }

    public delete(path: string, fetch: boolean = false) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);

        if (fetch) this.cache = this.storage.get() as Record<string, unknown>;

        const pathExists = this.get(path);
        if (pathExists === null)
            throw new Error('The path does not exists or its value is null');

        return this.update(path, null);
    }

    private sumOrSub(path: string, value: number, type: SumOrSub, fetch: boolean = false) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (!type || !['sum', 'sub'].includes(type))
            throw new Error('The type must be "sum" or "sub"');
        const isSum = type === 'sum';
        if (!value || typeof value !== 'number')
            throw new Error(
                `The value to ${isSum ? 'sum' : 'sub'} must be a number`,
            );

        if (fetch) this.cache = this.storage.get() as Record<string, unknown>;

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

    public sub(path: string, value: number, fetch: boolean = false) {
        return this.sumOrSub(path, value, 'sub', fetch);
    }

    public concat(path: string, value: string, fetch: boolean = false) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (!value || typeof value !== 'string')
            throw new Error('You must provide a string value to update');

        if (fetch) this.cache = this.storage.get() as Record<string, unknown>;

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

        if (fetch) this.cache = this.storage.get() as Record<string, unknown>;

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

        if (fetch) this.cache = this.storage.get() as Record<string, unknown>;

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
