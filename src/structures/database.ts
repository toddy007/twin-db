import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const pathErrorMessage = 'The path must be a string or you dont provide a path';

export class TwinDB {
    public data: Record<string, unknown>;
    public path: string;
    public name: string;

    public constructor(name: string = 'db') {
        this.path = 'database/' + name + '.json';
        this.name = name;
        this.data = {};

        if (!existsSync('database')) mkdirSync('database');
        this.load();
    }

    private async load() {
        let data: string;
        try {
            data = readFileSync(this.path, 'utf8');
        } catch (e) {
            data = '';
        }
        this.data = data ? JSON.parse(data) : {};

        if (!data)
            writeFileSync(
                this.path,
                JSON.stringify(this.data, null, 2),
                'utf8',
            );
    }

    private async update(path: string /*user.info.name*/, value: unknown) {
        const keys = path.split('.');

        if (keys.length > 1)
            for (let i = 0; i < keys.length - 1; i++) {
                const thisKeys = keys.slice(0, i + 1);
                const mappedKeys = thisKeys.map((key) => `['${key}']`);
                const searchedValue = await eval(
                    'this.data' + mappedKeys.join(''),
                );

                if (typeof searchedValue !== 'object')
                    await eval('this.data' + mappedKeys.join('') + ' = {}');
            } // percorre todos os objetos definindo eles como {} para não dar erro abaixo

        await eval(
            'this.data' +
                keys.map((key) => `['${key}']`).join('') +
                ` = ${JSON.stringify(value)}`,
        );

        writeFileSync(this.path, JSON.stringify(this.data, null, 2), 'utf8');

        return this.data;
    }

    public set(path: string, value: unknown) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (value === undefined)
            throw new Error('You must provide a value to update');

        return this.update(path, value);
    }

    public get(path: string): unknown | null {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        const keys = path.split('.');
        let current = this.data;
        let i = 0;

        for (const key of keys) {
            i++;

            if (i === keys.length) return current[key] ?? null;

            if (typeof current[key] !== 'object') return null;

            current = current[key] as Record<string, unknown>;
        }
    }

    public async delete(path: string) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        const keys = path.split('.');
        const pathExists = this.get(path);
        if (pathExists === null)
            throw new Error('The path does not exists or its value is null');

        const success = await eval(
            'delete this.data' + keys.map((key) => `['${key}']`).join(''),
        );
        if (!success) throw new Error('Could not delete the value');

        writeFileSync(this.path, JSON.stringify(this.data, null, 2), 'utf8');

        return this.data;
    }

    private sumOrSub(path: string, value: number, type: SumOrSub) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (!type || !['sum', 'sub'].includes(type))
            throw new Error('The type must be "sum" or "sub"');
        const isSum = type === 'sum';
        if (!value || typeof value !== 'number')
            throw new Error(
                `The value to ${isSum ? 'sum' : 'sub'} must be a number`,
            );

        let currentValue = (this.get(path) || 0) as unknown as number;
        if (typeof currentValue !== 'number') currentValue = 0;

        return this.update(
            path,
            isSum ? currentValue + value : currentValue - value,
        );
    }

    public sum(path: string, value: number) {
        return this.sumOrSub(path, value, 'sum');
    }

    public sub(path: string, value: number) {
        return this.sumOrSub(path, value, 'sub');
    }

    public concat(path: string, value: string) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (!value || typeof value !== 'string')
            throw new Error('You must provide a string value to update');

        const currentValue = this.get(path);
        if (typeof currentValue !== 'string')
            throw new Error(
                'The value to concat is not a string or the path does not exists',
            );

        return this.update(path, currentValue + value);
    }

    public push(path: string, ...values: unknown[]) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (!values || values.length === 0)
            throw new Error('You must provide a value to update');

        let currentValue = (this.get(path) || []) as unknown as unknown[];
        if (!Array.isArray(currentValue)) currentValue = [];

        currentValue.push(...values);
        return this.update(path, currentValue);
    }

    public pull(path: string, ...values: unknown[]) {
        if (!path || typeof path !== 'string')
            throw new Error(pathErrorMessage);
        if (!values || values.length === 0)
            throw new Error('You must provide a value to update');

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

export type SumOrSub = 'sum' | 'sub';
