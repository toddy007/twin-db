import { Storage } from "../types/Storage.js";
import { DatabaseSync } from "node:sqlite";
import path from 'node:path';

export class SqliteStorage implements Storage {
  private db: DatabaseSync;
  private name: string;

  public constructor(name: string) {
    this.name = name;
    const dbPath = path.join(process.cwd(), 'database', name + '.db');
    this.db = new DatabaseSync(dbPath);

    this.db.exec(`
            CREATE TABLE IF NOT EXISTS ${name} (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        `)
  }

  public set(value: string /*json strringfyed value*/) {
    this.db
      .prepare(`INSERT OR REPLACE INTO ${this.name} (key, value) VALUES (?, ?)`)
      .run('data', value);

    return true;
  }

  public get(): object | undefined {
    const row = this.db
      .prepare(`SELECT value FROM ${this.name} WHERE key = ?`)
      .get('data') as unknown as { value: string } | undefined;

    return row && JSON.parse(row.value);
  }
}
