### Before All
Make sure you're using `"type": "module"` in package.json.<br>
Make sure to pass just values that JSON accepts, if not, the values will be changed to `null`.
# How to Use?
To create a new database make the following step:
```js
import TwinDB from 'twin-db';
const database = new TwinDB('db');
```
And your database is done.
### You can make various databases too:
```js
import TwinDB from 'twin-db';
const database = new TwinDB('db');
const coolDatabase = new TwinDB('cool');
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
###  3. Delete Method
Deletes a value from data.
```js
database.delete('cool') // now the cool value no longer exists.
database.delete('address.country') // now the country no longer exists too.
```
### 4. Sum Method
Sum the current value of the given path with the given value.
```js
database.sum('age', 30); // now the age is 80.
```
### 5. Sub Method
Subtract the current value of the given path with the given value.
```js
database.sub('age', 10); // now the age is 70.
```
### 6. Concat Method
Concatenate the current value of the given path with the given value.
```js
database.concat('address.city', ' know'); // now the city is "I dont know".
```
### 7. Push Method
Push the given values into the current value array.
```js
database.push('hobbies', 'sleep', 'valorant'); // now the hobbies is ["cs", "pizza", "sleep", "valorant"].
```
### 8. Pull Method
```js
database.pull('hobbies', 'cs', 'sleep') // now the hobbies is ["pizza", "valorant"].
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
## Updates
`MM/DD/YYYY`<br>
04/09/2026 - 1.1.*
- Now **sum**, **sub** and **push** sets the value to the value you passed in execution when the path does not exists.

05/03/2026 - 1.2.*
- Now package doesn't uses eval anymore, providing better security.
