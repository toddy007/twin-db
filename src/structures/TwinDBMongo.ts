import lodash from 'lodash';
import { model, Model, connect } from 'mongoose';
import { SumOrSub, DefaultSchemaType } from '../types/global.js';
import { DefaultSchema } from '../utils/DefaultSchema.js';
import { DEFAULT_KEY, DEFAULT_NAME, pathErrorMessage } from '../utils/vars.js';

export class TwinDBMongo {
    private readonly model: Model<DefaultSchemaType>;
    public cache: Record<string, unknown>;
    private initPromise: Promise<void>;
    private readonly id: string;

    public constructor(connectionURI: string, modelName: string = DEFAULT_NAME, id: string = DEFAULT_KEY) {
        if (!modelName || typeof modelName !== 'string') modelName = DEFAULT_NAME;
        if (!id || typeof id !== 'string') id = DEFAULT_KEY;

        this.model = model(modelName, DefaultSchema);
        this.cache = {};
        this.id = id;

        this.initPromise = this.init(connectionURI);
    }

    private async init(connectionURI: string) {
        await connect(connectionURI);

        const data = await this.model.findById(this.id);

        if (!data) {
            const created = await this.model.create({
                _id: this.id,
                data: {},
            });

            this.cache = created.data;
            return;
        }

        this.cache = data.data;
    }

    private async ready() {
        await this.initPromise;
    }

    private async update(path: string, value: unknown, fetch: boolean = false) {
        await this.ready();
        if (fetch) {
            const data = await this.model.findById(this.id);
            this.cache = data ? data.data : {};
        }

        lodash.set(this.cache, path, value);

        await this.model.updateOne({ _id: this.id }, { data: this.cache }, { upsert: true });

        return this.cache;
    }

    public async set(path: string, value: unknown, fetch: boolean = false) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (value === undefined)
            throw new Error('You must provide a value to update');

        return this.update(path, value, fetch);
    }

    public async get(path: string, fetch: boolean = false): Promise<unknown | null> {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);

        await this.ready();
        if (fetch) {
            const data = await this.model.findById(this.id);
            this.cache = data ? data.data : {};
        }

        return lodash.get(this.cache, path, null);
    }

    public async delete(path: string, fetch: boolean = false) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);

        await this.ready();
        if (fetch) {
            const data = await this.model.findById(this.id);
            this.cache = data ? data.data : {};
        }

        const pathExists = await this.get(path);
        if (pathExists === null)
            throw new Error('The path does not exists or its value is null');

        return this.update(path, null);
    }

    private async sumOrSub(path: string, value: number, type: SumOrSub, fetch: boolean = false) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (!type || !['sum', 'sub'].includes(type))
            throw new Error('The type must be "sum" or "sub"');
        const isSum = type === 'sum';
        if (!value || typeof value !== 'number')
            throw new Error(
                `The value to ${isSum ? 'sum' : 'sub'} must be a number`,
            );

        await this.ready();
        if (fetch) {
            const data = await this.model.findById(this.id);
            this.cache = data ? data.data : {};
        }

        let currentValue = (await this.get(path) || 0) as unknown as number;
        if (typeof currentValue !== 'number') currentValue = 0;

        return this.update(
            path,
            isSum ? currentValue + value : currentValue - value,
        );
    }

    public async sum(path: string, value: number, fetch: boolean = false) {
        return this.sumOrSub(path, value, 'sum', fetch);
    }

    public async sub(path: string, value: number, fetch: boolean = false) {
        return this.sumOrSub(path, value, 'sub', fetch);
    }

    public async concat(path: string, value: string, fetch: boolean = false) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (!value || typeof value !== 'string')
            throw new Error('You must provide a string value to update');

        await this.ready();
        if (fetch) {
            const data = await this.model.findById(this.id);
            this.cache = data ? data.data : {};
        }

        const currentValue = await this.get(path);
        if (typeof currentValue !== 'string')
            throw new Error(
                'The value to concat is not a string or the path does not exists',
            );

        return this.update(path, currentValue + value);
    }

    public async push(path: string, values: unknown[], fetch: boolean = false) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (!values || values.length === 0)
            throw new Error('You must provide a value to update');

        await this.ready();
        if (fetch) {
            const data = await this.model.findById(this.id);
            this.cache = data ? data.data : {};
        }

        let currentValue = (await this.get(path) || []) as unknown as unknown[];
        if (!Array.isArray(currentValue)) currentValue = [];

        currentValue.push(...values);
        return this.update(path, currentValue);
    }

    public async pull(path: string, values: unknown[], fetch: boolean = false) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (!values || values.length === 0)
            throw new Error('You must provide a value to update');

        await this.ready();
        if (fetch) {
            const data = await this.model.findById(this.id);
            this.cache = data ? data.data : {};
        }

        const currentValue = await this.get(path);
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
