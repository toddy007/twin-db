### Before All
Make sure to pass just values that JSON accepts, if not, the values will be changed to `null`.

# How to Use?
To create a new database make the following step:
```js
import { TwinDB } from 'twin-db';
const database = new TwinDB('database/twin');
```
or
```js
const { TwinDB } = require('twin-db');
const database = new TwinDB('database/twin');
```
And your database is done.
### You can make various databases too:
```js
import { TwinDB } from 'twin-db';
const database = new TwinDB('database/db');
const coolDatabase = new TwinDB('database/cool');
```
> The first argument is a file **path** — folders in it are created automatically if they don't exist. If you don't pass one, it defaults to `database/twin`.

# Storages
By default, `TwinDB` saves your data in a local `.json` file (`JSONStorage`). If you'd rather store it in a local SQLite database, pass `SqliteStorage` in the options:
```js
import { TwinDB, SqliteStorage } from 'twin-db';

const database = new TwinDB('database/db', { storage: SqliteStorage });
```
`SqliteStorage` also accepts an optional `table` and `key`, in case you want more than one database sharing the same `.db` file:
```js
const database = new TwinDB('database/db', {
  storage: SqliteStorage,
  table: 'users', // defaults to "twin"
  key: 'main',    // defaults to "data"
});
```
Both storages implement the same interface, so switching between them doesn't change any of the methods in **Database Methods**.

# TwinMongoDB
If you'd rather store your data in MongoDB instead of locally, use `TwinMongoDB`. It shares the exact same methods as `TwinDB` (`set`, `get`, `has`, `all`, `delete`, `sum`, `sub`, `concat`, `push`, `pull`, all with the same `fetch` parameter), the only difference is how you create it and that every method is asynchronous:
```js
import { TwinMongoDB } from 'twin-db';

const database = new TwinMongoDB('mongodb://localhost:27017/mydb', 'myCollection', 'myId');

await database.set('name', 'De');
const name = await database.get('name');
await database.push('hobbies', ['sleep'], true);
```
- `connectionURI` (required) — your MongoDB connection string.
- `modelName` (optional) — the collection name, defaults to `"twin"`.
- `id` (optional) — the document `_id` used to store your data, defaults to `"data"`. Useful if you want multiple independent databases inside the same collection.

When you're done with it (e.g. before your process exits), make sure to close the connection so it doesn't hang:
```js
await database.close();
```

# Database Methods
Now we going to explain you the database methods.<br>
Imagine the following data from a random database:
```json
{
  "name": "Daniel",
  "surname": "Costa",
  "age": 60,
  "cool": false,
  "hobbies": ["cs", "pizza"],
  "address": {
    "city": "I dont",
    "state": "ES",
    "country": "Brazil"
  }
}
```
### 1. Set Method
This one changes the value of a path to the value you passed.
```js
database.set('name', 'De'); // now the name is "De".
database.set('age', 50); // now the age is 50.
```
- To go through the object, make sure to use ".", like `address.city`.
### 2. Get Method
Get a value from a given path.
```js
database.get('surname'); // returns "Costa".
```
- `get` accepts an optional generic type parameter, so you can type the return value: `database.get<string>('surname')`.
  - If you don't pass one, the return type is `unknown | null`.
- It's just a TypeScript type hint — it doesn't validate or convert the value at runtime.

**Example**:
```js
database.get<string>('address.country') // will return string | null;
```
### 3. Has Method
Checks whether a given path exists (is not `null`).
```js
database.has('surname'); // returns true.
database.has('nickname'); // returns false.
```
### 4. All Method
Returns the entries of an object path as an array of `{ id, value }`. If no path is passed, it uses the whole database. Throws if the resolved value isn't a plain object.
```js
database.all('address'); // returns [{ id: "city", value: "I dont" }, { id: "state", value: "ES" }, { id: "country", value: "Brazil" }].
database.all(); // no path passed, returns [{ id: "name", value: "Daniel" }, { id: "surname", value: "Costa" }, { id: "age", value: 60 }, { id: "cool", value: false }, { id: "hobbies", value: ["cs", "pizza"] }, { id: "address", value: { city: "I dont", state: "ES", country: "Brazil" } }].
```
###  5. Delete/Remove Method
Deletes a value from data.
```js
database.delete('cool') // now the cool value no longer exists.
database.delete('address.country') // now the country no longer exists too.
```
### 6. Sum/Add Method
Sum the current value of the given path with the given value.
```js
database.sum('age', 30); // now the age is 80.
```
### 7. Sub/Subtract Method
Subtract the current value of the given path with the given value.
```js
database.sub('age', 10); // now the age is 70.
```
### 8. Concat Method
Concatenate the current value of the given path with the given value.
```js
database.concat('address.city', ' know'); // now the city is "I dont know".
```
### 9. Push Method
Push the given values into the current value array. **The values must be passed as an array**, even if it's just one value.
```js
database.push('hobbies', ['sleep', 'valorant']); // now the hobbies is ["cs", "pizza", "sleep", "valorant"].
```
### 10. Pull Method
Removes the given values from the current value array. **The values must be passed as an array**, even if it's just one value.
```js
database.pull('hobbies', ['cs', 'sleep']) // now the hobbies is ["pizza", "valorant"].
```
### Now the data object will looks like that:
```json
{
  "name": "De",
  "surname": "Costa",
  "age": 70,
  "hobbies": ["pizza", "valorant"],
  "address": {
    "city": "I dont know",
    "state": "ES"
  }
}
```

## The `fetch` parameter
Every method above accepts an optional `fetch` boolean as its last parameter (default `false`). When `true`, it re-reads the storage before running the operation and refreshes the cache with it — useful if another process might have written to the same storage since your last read.
```js
database.get('name', true);
database.push('hobbies', ['sleep'], true);
```

## Updates
See new updates [here](https://github.com/toddy007/twin-db/releases).
