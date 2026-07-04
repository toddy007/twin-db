import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { Storage } from "../types/Storage.js";
import path from 'node:path';

export class JSONStorage implements Storage {
  public readonly path: string;

  public constructor(name: string) {
    this.path = path.join(process.cwd(), 'database', name + '.json');

    if (!existsSync(this.path))
      writeFileSync(this.path, '{}', 'utf8');
    else {
      const data = readFileSync(this.path, 'utf8');
      const parsedData = JSON.parse(data).catch(() => null);

      if ((!data) || (!parsedData) || typeof parsedData !== 'object' || Array.isArray(parsedData))
        writeFileSync(this.path, '{}', 'utf8');
    }
  }

  public get() {
    let data;
    try {
      data = readFileSync(this.path, 'utf8');
    } catch (_) { }

    if (!data)
      writeFileSync(this.path, '{}', 'utf8');

    return data ? JSON.parse(data) : {};
  }

  public set(value: string) {
    writeFileSync(this.path, value, 'utf8');

    return true;
  }
}
