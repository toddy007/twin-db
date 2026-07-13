import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { Storage } from '../types/Storage.js';

export class JSONStorage implements Storage {
    public readonly path: string;

    public constructor(path: string) {
        if (!path.endsWith('.json')) path += '.json';
        this.path = path;

        if (!existsSync(path)) writeFileSync(path, '{}', 'utf8');
        else {
            const data = readFileSync(path, 'utf8');
            let parsedData;
            try {
                parsedData = JSON.parse(data);
            } catch (_) {}

            if (
                !data ||
                !parsedData ||
                typeof parsedData !== 'object' ||
                Array.isArray(parsedData)
            )
                writeFileSync(path, '{}', 'utf8');
        }
    }

    public get() {
        let data;
        try {
            data = readFileSync(this.path, 'utf8');
        } catch (_) {}

        let parsedData;
        try {
            if (data) parsedData = JSON.parse(data);
        } catch (_) {}

        const checkedData =
            data &&
            parsedData &&
            typeof parsedData === 'object' &&
            !Array.isArray(parsedData);
        if (!checkedData) writeFileSync(this.path, '{}', 'utf8');

        return checkedData ? parsedData : {};
    }

    public set(value: string) {
        writeFileSync(this.path, value, 'utf8');

        return true;
    }
}
