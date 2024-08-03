# Project: ALX Files Manager

This project is a summary of the back-end trimester, covering topics such as authentication, NodeJS, MongoDB, Redis, pagination, and background processing. The objective is to build a simple platform for uploading and viewing files, with features like user authentication, file listing, file upload, permission management, file viewing, and image thumbnail generation.

## Getting Started

To get started with this project, make sure you have the following resources:

- [Node JS](https://nodejs.org/) - Getting started guide
- [Express](https://expressjs.com/) - Getting started guide
- [MongoDB](https://www.mongodb.com/) - Official documentation
- [Redis](https://redis.io/) - Official documentation
- [Bull](https://optimalbits.github.io/bull/) - Official documentation
- [Image Thumbnail](https://www.npmjs.com/package/image-thumbnail) - NPM package
- [Mime-Types](https://www.npmjs.com/package/mime-types) - NPM package

## Learning Objectives

By the end of this project, you should be able to:

- Create an API with Express
- Authenticate a user
- Store data in MongoDB
- Store temporary data in Redis
- Setup and use a background worker

## Requirements

- Editors: vi, vim, emacs, Visual Studio Code
- Operating System: Ubuntu 18.04 LTS
- Node version: 12.x.x
- All files should end with a new line
- ESLint will be used for code linting

## Project Structure

The project includes the following provided files:

- `package.json`
- `.eslintrc.js`
- `babel.config.js`

Make sure to run `npm install` to install the required dependencies mentioned in `package.json`.



## Task 0: Redis utils

Inside the `utils` folder, create a file `redis.js` that contains the `RedisClient` class. The `RedisClient` class should have the following:

- A constructor that creates a client to Redis. Any error from the Redis client should be displayed in the console using `on('error')` of the Redis client.
- A function `isAlive` that returns `true` when the connection to Redis is successful, otherwise `false`.
- An asynchronous function `get` that takes a string key as an argument and returns the Redis value stored for this key.
- An asynchronous function `set` that takes a string key, a value, and a duration in seconds as arguments to store it in Redis with an expiration set by the duration argument.
- An asynchronous function `del` that takes a string key as an argument and removes the value in Redis for this key.

After the class definition, create and export an instance of `RedisClient` called `redisClient`.

Example usage:

```javascript
import redisClient from './utils/redis';

(async () => {
  console.log(redisClient.isAlive());
  console.log(await redisClient.get('myKey'));
  await redisClient.set('myKey', 12, 5);
  console.log(await redisClient.get('myKey'));

  setTimeout(async () => {
    console.log(await redisClient.get('myKey'));
  }, 1000*10)
})();
```

## Task 1: MongoDB utils

Inside the folder `utils`, create a file `db.js` that contains the class `DBClient`.

`DBClient` should have:

- The constructor that creates a client to MongoDB:
  - `host`: from the environment variable `DB_HOST` or default: `localhost`
  - `port`: from the environment variable `DB_PORT` or default: `27017`
  - `database`: from the environment variable `DB_DATABASE` or default: `files_manager`
- A function `isAlive` that returns `true` when the connection to MongoDB is successful, otherwise `false`.
- An asynchronous function `nbUsers` that returns the number of documents in the collection `users`.
- An asynchronous function `nbFiles` that returns the number of documents in the collection `files`.

After the class definition, create and export an instance of `DBClient` called `dbClient`.

Example usage:

```javascript
import dbClient from './utils/db';

const waitConnection = () => {
    return new Promise((resolve, reject) => {
        let i = 0;
        const repeatFct = async () => {
            await setTimeout(() => {
                i += 1;
                if (i >= 10) {
                    reject()
                }
                else if(!dbClient.isAlive()) {
                    repeatFct()
                }
                else {
                    resolve()
                }
            }, 1000);
        };
        repeatFct();
    })
};

(async () => {
    console.log(dbClient.isAlive());
    await waitConnection();
    console.log(dbClient.isAlive());
    console.log(await dbClient.nbUsers());
    console.log(await dbClient.nbFiles());
})();
```

## Task 2: First API

Inside `server.js`, create the Express server:

- It should listen on the port set by the environment variable `PORT` or by default `5000`.
- It should load all routes from the file `routes/index.js`.

Inside the folder `routes`, create a file `index.js` that contains all endpoints of our API:

- `GET /status` => `AppController.getStatus`
- `GET /stats` => `AppController.getStats`

Inside the folder `controllers`, create a file `AppController.js` that contains the definition of the 2 endpoints:

- `GET /status` should return if Redis is alive and if the DB is alive too by using the 2 utils created previously: `{ "redis": true, "db": true }` with a status code 200.
- `GET /stats` should return the number of users and files in DB: `{ "users": 12, "files": 1231 }` with a status code 200.
  - `users` collection must be used for counting all users.
  - `files` collection must be used for counting all files.

Terminal 1:

```
bob@dylan:~$ npm run start-server
Server running on port 5000
...
```

Terminal 2:

```
bob@dylan:~$ curl 0.0.0.0:5000/status ; echo ""
{"redis":true,"db":true}
bob@dylan:~$ 
bob@dylan:~$ curl 0.0.0.0:5000/stats ; echo ""
{"users":4,"files":30}
bob@dylan:~$ 
```

## Task 3: Create a new user

In the file `routes/index.js`, add a new endpoint:

- `POST /users` => `UsersController.postNew`

Inside `controllers`, add a file `UsersController.js` that contains the new endpoint:

- `POST /users` should create a new user in DB:
  - To create a user, you must specify an email and a password.
  - If the email is missing, return an error "Missing email" with a status code 400.
  - If the password is missing, return an error "Missing password" with a status code 400.
  - If the email already exists in DB, return an error "Already exist" with a status code 400.
  - The password must be stored after being hashed in SHA1.
  - The endpoint is returning the new user with only the email and the id (auto generated by MongoDB) with a status code 201.
  - The new user must be saved in the collection `users`:
    - `email`: same as the value received
    - `password`: SHA1 value of the value received.

Example usage:

```
bob@dylan:~$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com", "password": "toto1234!" }' ; echo ""
{"id":"5f1e7d35c7ba06511e683b21","email":"bob@dylan.com"}
bob@dylan:~$ 
bob@dylan:~$ echo 'db.users.find()' | mongo files_manager
{ "_id" : ObjectId("5f1e7d35c7ba06511e683b21"), "email" : "bob@dylan.com", "password" : "89cad29e3ebc1035b29b1478a8e70854f25fa2b2" }
bob@dylan:~$ 
bob@dylan:~$ 
bob@dylan:~$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com", "password": "toto1234!" }' ; echo ""
{"error":"Already exist"}
bob@dylan:~$ 
bob@dylan:~$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com" }' ; echo ""
{"error":"Missing password"}
bob@dylan:~$ 
```

## Task 4: Authenticate a user

In the file `routes/index.js`, add 3 new endpoints:

- `GET /connect` => `AuthController.getConnect`
- `GET /disconnect` => `AuthController.getDisconnect`
- `GET /users/me` => `UserController.getMe`

Inside `controllers`, add a file `AuthController.js` that contains new endpoints:

- `GET /connect` should sign-in the user by generating a new authentication token:
  - By using the header `Authorization` and the technique of the Basic auth (Base64 of the `<email>:<password>`), find the user associated with this email and password (reminder: we are storing the SHA1 of the password).
  - If no user has been found, return an error "Unauthorized" with a status code 401.
  - Otherwise:
    - Generate a random string (using uuidv4) as token.
    - Create a key: `auth_<token>`.
    - Use this key to store in Redis (by using the `redisClient` created previously) the user ID for 24 hours.
    - Return this token: `{ "token": "155342df-2399-41da-9e8c-458b6ac52a0c" }` with a status code 200.

- `GET /disconnect` should sign-out the user based on the token:
  - Retrieve the user based on the token:
    - If not found, return an error "Unauthorized" with a status code 401.
    - Otherwise, delete the token in Redis and return nothing with a status code 204.

Inside the file `controllers/UsersController.js` add a new endpoint:

- `GET /users/me` should retrieve the user based on the token:
  - Retrieve the user based on the token:
    - If not found, return an error "Unauthorized" with a status code 401.
    - Otherwise, return the user object (email and id only).

Example usage:

```
bob@dylan:~$ curl 0.0.0.0:5000/connect -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=" ; echo ""
{"token":"031bffac-3edc-4e51-aaae-1c121317da8a"}
bob@dylan:~$ 
bob@dylan:~$ curl 0.0.0.0:5000/users/me -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a" ; echo ""
{"id":"5f1e7cda04a394508232559d","email":"bob@dylan.com"}
bob@dylan:~$ 
bob@dylan:~$ curl 0.0.0.0:5000/disconnect -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a" ; echo ""

bob@dylan:~$ curl 0.0.0.0:5000/users/me -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a" ; echo ""
{"error":"Unauthorized"}
bob@dylan:~$ 
```

## Task 5: First file

In the file `routes/index.js`, add a new endpoint:

- `POST /files` => `FilesController.postUpload`

Inside `controllers`, add a file `FilesController.js` that contains the new endpoint:

- `POST /files` should create a new file in DB and in disk:
  - Retrieve the user based on the token:
    - If not found, return an error "Unauthorized" with a status code 401.
  - To create a file, you must specify:
    - `name`: as filename
    - `type`: either folder, file or image
    - `parentId`: (optional) as ID of the parent (default: 0 -> the root)
    - `isPublic`: (optional) as boolean to define if the file is public or not (default: false)
    - `data`: (only for type=file|image) as Base64 of the file content
  - If the `name` is missing, return an error "Missing name" with a status code 400.
  - If the `type` is missing or not part of the list of accepted types, return an error "Missing type" with a status code 400.
  - If the `data` is missing and `type` != folder, return an error "Missing data" with a status code 400.
  - If the `parentId` is set:
    - If no file is present in DB for this `parentId`, return an error "Parent not found" with a status code 400.
    - If the file present in DB for this `parentId` is not of type folder, return an error "Parent is not a folder" with a status code 400.
  - The user ID should be added to the document saved in DB - as owner of a file.
  - If the `type` is folder, add the new file document in the DB and return the new file with a status code 201.
  - Otherwise:
    - All files will be stored locally in a folder (to create automatically if not present):
      - The relative path of this folder is given by the environment variable `FOLDER_PATH`.
      - If this variable is not present or empty, use `/tmp/files_manager` as the storing folder path.
    - Create a local path in the storing folder with filename as a UUID.
    - Store the file in clear (reminder: `data` contains the Base64 of the file) in this local path.
    - Add the new file document in the collection `files` with these attributes:
      - `userId`: ID of the owner document (owner from the authentication)
      - `name`: same as the value received
      - `type`: same as the value received
      - `isPublic`: same as the value received
      - `parentId`: same as the value received - if not present: 0
      - `localPath`: for a type=file|image, the absolute path to the file saved locally.
    - Return the new file with a status code 201.

Example usage:

```
bob@dylan:~$ curl 0.0.0.0:5000/connect -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=" ; echo ""
{"token":"f21fb953-16f9-46ed-8d9c-84c6450ec80f"}
bob@dylan:~$ 
bob@dylan:~$ curl -XPOST 0.0.0.0:5000/files -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f" -H "Content-Type: application/json" -d '{ "name": "myText.txt", "type": "file", "data": "SGVsbG8gV2Vic3RhY2shCg==" }' ; echo ""
{"id":"5f1e879ec7ba06511e683b22","userId":"5f1e7cda04a394508232559d","name":"myText.txt","type":"file","isPublic":false,"parentId":0}
bob@dylan:~$
bob@dylan:~$ ls /tmp/files_manager/
2a1f4fc3-687b-491a-a3d2-5808a02942c9
bob@dylan:~$
bob@dylan:~$ curl -XPOST 0.0.0.0:5000/files -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f" -H "Content-Type: application/json" -d '{ "name": "images", "type": "folder" }' ; echo ""
{"id":"5f1e881cc7ba06511e683b23","userId":"5f1e7cda04a394508232559d","name":"images","type":"folder","isPublic":false,"parentId":0}
bob@dylan:~$
bob@dylan:~$ cat image_upload.py
import base64
import requests
import sys

file_path = sys.argv[1]
file_name = file_path.split('/')[-1]

file_encoded = None
with open(file_path, "rb") as image_file:
    file_encoded = base64.b64encode(image_file.read()).decode('utf-8')

r_json = { 'name': file_name, 'type': 'image', 'isPublic': True, 'data': file_encoded, 'parentId': sys.argv[3] }
r_headers = { 'X-Token': sys.argv[2] }

r = requests.post("http://0.0.0.0:5000/files", json=r_json, headers=r_headers)
print(r.json())

bob@dylan:~$
bob@dylan:~$ python image_upload.py image.png f21fb953-16f9-46ed-8d9c-84c6450ec80f 5f1e881cc7ba06511e683b23
{'id': '5f1e8896c7ba06511e683b25', 'userId': '5f1e7cda04a394508232559d', 'name': 'image.png', 'type': 'image', 'isPublic': True, 'parentId': '5f1e881cc7ba06511e683b23'}
bob@dylan:~$
bob@dylan:~$ echo 'db.files.find()' | mongo files_manager
{ "_id" : ObjectId("5f1e881cc7ba06511e683b23"), "userId" : ObjectId("5f1e7cda04a394508232559d"), "name" : "images", "type" : "folder", "parentId" : "0" }
{ "_id" : ObjectId("5f1e879ec7ba06511e683b22"), "userId" : ObjectId("5f1e7cda04a394508232559d"), "name" : "myText.txt", "type" : "file", "parentId" : "0", "isPublic" : false, "localPath" : "/tmp/files_manager/2a1f4fc3-687b-491a-a3d2-5808a02942c9" }
{ "_id" : ObjectId("5f1e8896c7ba06511e683b25"), "userId" : ObjectId("5f1e7cda04a394508232559d"), "name" : "image.png", "type" : "image", "parentId" : ObjectId("5f1e881cc7ba06511e683b23"), "isPublic" : true, "localPath" : "/tmp/files_manager/51997b88-5c42-42c2-901e-e7f4e71bdc47" }
bob@dylan:~$
bob@dylan:~$ ls /tmp/files_manager/
2a1f4fc3-687b-491a-a3d2-5808a02942c9   51997b88-5c42-42c2-901e-e7f4e71bdc47
bob@dylan:~$
```

Remember to start and end your answer with -+-+-+-+-+. The markdown that would fit at $PLACEHOLDER$ is:

```markdown


Make sure to run `npm run dev main.js` to execute the code.
