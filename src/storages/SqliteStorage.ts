import { Storage } from '../types/Storage.js';
import { DatabaseSync } from 'node:sqlite';
import { DEFAULT_KEY, DEFAULT_NAME } from '../utils/vars.js';

export class SqliteStorage implements Storage {
    private readonly db: DatabaseSync;
    private readonly table: string;
    private readonly key: string;

    public constructor(
        path: string,
        table: string = DEFAULT_NAME,
        key: string = DEFAULT_KEY,
    ) {
        if (!table || typeof table !== 'string') table = DEFAULT_NAME;
        if (!key || typeof key !== 'string') key = DEFAULT_KEY;

        this.table = table;
        this.key = key;

        if (!path.endsWith('.db')) path += '.db';
        this.db = new DatabaseSync(path);

        this.db.exec(`
        CREATE TABLE IF NOT EXISTS ${table} (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    `);
    }

    public set(value: string /*json strringfyed value*/) {
        this.db
            .prepare(
                `INSERT OR REPLACE INTO ${this.table} (key, value) VALUES (?, ?)`,
            )
            .run(this.key, value);

        return true;
    }

    public get() {
        const row = this.db
            .prepare(`SELECT value FROM ${this.table} WHERE key = ?`)
            .get(this.key) as unknown as { value: string } | undefined;

        return row ? JSON.parse(row.value) : {};
    }
}
