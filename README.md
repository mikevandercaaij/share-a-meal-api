# share-a-meal-api

Welcome to the official Share a Meal API. While using this API you'll be able to create an application where it's possible to create users and meals, but also sign up for dinner occasions. No one wants to throw out food right? So why not share it with others?

## Installation

In order for the application to work you'll need to create a MYSQL database. This can either be done locally or online. The script (_share-a-meal.sql_) that is needed to fill your database with the fitting tables is given in the project. Follow the following steps to download/start the project.

Clone the project

```bash
  git clone https://github.com/mikevandercaaij/share-a-meal-api.git
```

Go to the project directory

```bash
  cd share-a-meal-api
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

## Environment Variables

To run this project, you will need to create an .env file and add the following environment variables to it.

`PORT`
`JWT_SECRET`
`LOGLEVEL`
`DB_HOST`
`DB_PORT`
`DB_USER`
`DB_PASSWORD`
`DB_DATABASE`

## API Reference

For a lot of request you'll need to be logged in first. After logging in you're able to use the given `token` in order to do such requests.

### Login

```
  POST /api/auth/login
```

#### Request body

| Parameter     | Type     | Description  |
| :------------ | :------- | :----------: |
| `emailAdress` | `string` | **Required** |
| `password`    | `string` | **Required** |

#### Response

```json
    "status": 200,
    "result": {
        "id": 41,
        "emailAdress": "test@student.com",
        "firstName": "Mike",
        "lastName": "van den Caaij",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQxLCJpYXQiOjE2NTMwNjAwNzgsImV4cCI6MTY1NDA5Njg3OH0.hs4TpYhyJB2mx9qAx6LZwCN_cdCHSheQqvGYyIVfAN4"
    }
```

### Get all users

```
  GET /api/user/
```

#### Header

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `token`   | `Bearer` | **Required** |

#### Response

```json
{
    "status": 200,
    "result": [
        {
            "id": 1,
            "firstName": "Klaas",
            "lastName": "Tilburg",
            "isActive": true,
            "emailAdress": "k.tilburg@holland.com",
            "password": "$2b$10$N2YcqlA5/Di1MO5lzLhm0uGsqHlxB4FixO8J03Ug2VMGv16z6Ixry",
            "phoneNumber": "0638719633",
            "roles": [],
            "street": "Hopstraat",
            "city": "Amsterdam"
        },
        {
            "id": 2,
            "firstName": "John",
            "lastName": "Doe",
            "isActive": true,
            "emailAdress": "j.doe@server.com",
            "password": "$2b$10$N2YcqlA5/Di1MO5lzLhm0uGsqHlxB4FixO8J03Ug2VMGv16z6Ixry",
            "phoneNumber": "0612425475",
            "roles": ["editor", "guest"],
            "street": "Lovendijkselaan 21",
            "city": "Breda"
        }
    ]
}
```

### Get users using parameters

```
  GET /api/user?firstName=Klaas&isActive=true
```

#### Header

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `token`   | `Bearer` | **Required** |

#### URL parameters (a maximum of 2 parameters are tolerated)

| Parameter     | Type             | Description  |
| :------------ | :--------------- | :----------: |
| `firstName`   | `string`         | **Optional** |
| `lastName`    | `string`         | **Optional** |
| `emailAdress` | `string`         | **Optional** |
| `street`      | `string`         | **Optional** |
| `city`        | `string`         | **Optional** |
| `phoneNumber` | `string`         | **Optional** |
| `limit`       | `number`         | **Optional** |
| `isActive`    | `boolean/number` | **Optional** |

#### Response

```json
{
    "status": 200,
    "result": [
        {
            "id": 3,
            "firstName": "Klaas",
            "lastName": "Tilburg",
            "isActive": true,
            "emailAdress": "k.tilburg@holland.com",
            "password": "$2b$10$N2YcqlA5/Di1MO5lzLhm0uGsqHlxB4FixO8J03Ug2VMGv16z6Ixry",
            "phoneNumber": "0638719633",
            "roles": [],
            "street": "Hopstraat",
            "city": "Amsterdam"
        }
    ]
}
```

### Get user by id

```
  GET /api/user/:id
```

#### Header

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `token`   | `Bearer` | **Required** |

#### URL parameters

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `id`      | `number` | **Required** |

#### Response

```json
{
    "status": 200,
    "result": [
        {
            "id": 1,
            "firstName": "Klaas",
            "lastName": "Tilburg",
            "isActive": true,
            "emailAdress": "k.tilburg@holland.com",
            "password": "$2b$10$N2YcqlA5/Di1MO5lzLhm0uGsqHlxB4FixO8J03Ug2VMGv16z6Ixry",
            "phoneNumber": "0638719633",
            "roles": [],
            "street": "Hopstraat",
            "city": "Amsterdam"
        }
    ]
}
```

### Get user profile (User that's currently logged in)

```
  GET /api/user/profile
```

#### Header

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `token`   | `Bearer` | **Required** |

#### Response

```json
{
    "status": 200,
    "result": [
        {
            "id": 1,
            "firstName": "Klaas",
            "lastName": "Tilburg",
            "isActive": true,
            "emailAdress": "k.tilburg@holland.com",
            "password": "$2b$10$N2YcqlA5/Di1MO5lzLhm0uGsqHlxB4FixO8J03Ug2VMGv16z6Ixry",
            "phoneNumber": "0638719633",
            "roles": [],
            "street": "Hopstraat",
            "city": "Amsterdam"
        }
    ]
}
```

### Create user

```
  POST /api/user/
```

#### Header

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `token`   | `Bearer` | **Required** |

#### Request body

| Parameter     | Type     | Description  |
| :------------ | :------- | :----------: |
| `firstName`   | `string` | **Required** |
| `lastName`    | `string` | **Required** |
| `emailAdress` | `string` | **Required** |
| `password`    | `string` | **Required** |
| `phoneNumber` | `string` | **Required** |
| `street`      | `string` | **Required** |
| `city`        | `string` | **Required** |

#### Response

```json
{
    "status": 201,
    "result": {
        "id": 42,
        "firstName": "Jeroen",
        "lastName": "van den Dullemen",
        "isActive": true,
        "emailAdress": "j.vddullemen@gmail.com",
        "password": "$2b$10$Rcxwa/qmX0Hh.6a8dS3pZOjBvpPqkqBCrQgEOO.v/6MJy4lTmYLjq",
        "phoneNumber": "0638719633",
        "roles": ["editor", "guest"],
        "street": "Amsterdamseweg 1",
        "city": "Groningen"
    }
}
```

### Update user

```
  PUT /api/user/:id
```

#### Header

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `token`   | `Bearer` | **Required** |

#### URL parameters

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `id`      | `number` | **Required** |

#### Request body

| Parameter     | Type     | Description  |
| :------------ | :------- | :----------: |
| `firstName`   | `string` | **Optional** |
| `lastName`    | `string` | **Optional** |
| `emailAdress` | `string` | **Optional** |
| `password`    | `string` | **Optional** |
| `phoneNumber` | `string` | **Optional** |
| `street`      | `string` | **Optional** |
| `city`        | `string` | **Optional** |

#### Response

```json
{
    "status": 200,
    "result": [
        {
            "id": 1,
            "firstName": "Klaas",
            "lastName": "Tilburg",
            "isActive": true,
            "emailAdress": "k.tilburg@holland.com",
            "password": "$2b$10$N2YcqlA5/Di1MO5lzLhm0uGsqHlxB4FixO8J03Ug2VMGv16z6Ixry",
            "phoneNumber": "0638719633",
            "roles": [],
            "street": "Hopstraat",
            "city": "Amsterdam"
        }
    ]
}
```

### Delete user

```
  DELETE /api/user/:id
```

#### Header

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `token`   | `Bearer` | **Required** |

#### URL parameters

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `id`      | `number` | **Required** |

#### Response

```json
{
    "status": 200,
    "message": "User has been deleted successfully."
}
```

### Get all meals

```
  GET /api/meal/
```

#### Response

```json
{
    "status": 200,
    "result": [
        {
            "id": 1,
            "isActive": true,
            "isVega": false,
            "isVegan": false,
            "isToTakeHome": true,
            "dateTime": "2022-03-22T16:35:00.000Z",
            "maxAmountOfParticipants": 4,
            "price": "12.75",
            "imageUrl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
            "createDate": "2022-02-26T17:12:40.048Z",
            "updateDate": "2022-04-26T10:33:51.000Z",
            "name": "Pasta Bolognese met tomaat, spekjes en kaas",
            "description": "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
            "allergenes": ["gluten", "lactose"],
            "cook": {
                "id": 1,
                "firstName": "Mariëtte",
                "lastName": "van den Dullemen",
                "isActive": true,
                "emailAdress": "m.vandullemen@server.nl",
                "password": "secret",
                "phoneNumber": "",
                "roles": [],
                "street": "",
                "city": ""
            },
            "participants": [
                {
                    "id": 1,
                    "firstName": "Mariëtte",
                    "lastName": "van den Dullemen",
                    "isActive": true,
                    "emailAdress": "m.vandullemen@server.nl",
                    "password": "secret",
                    "phoneNumber": "",
                    "roles": [],
                    "street": "",
                    "city": ""
                },
                {
                    "id": 3,
                    "firstName": "John",
                    "lastName": "Doe",
                    "isActive": true,
                    "emailAdress": "j.doe@server.com",
                    "password": "secret",
                    "phoneNumber": "06 12425475",
                    "roles": ["editor", "guest"],
                    "street": "",
                    "city": ""
                }
            ]
        },
        {
            "id": 2,
            "isActive": true,
            "isVega": true,
            "isVegan": false,
            "isToTakeHome": false,
            "dateTime": "2022-05-22T11:35:00.000Z",
            "maxAmountOfParticipants": 4,
            "price": "12.75",
            "imageUrl": "https://static.ah.nl/static/recepten/img_RAM_PRD159322_1024x748_JPG.jpg",
            "createDate": "2022-02-26T17:12:40.048Z",
            "updateDate": "2022-04-25T10:56:05.000Z",
            "name": "Aubergine uit de oven met feta, muntrijst en tomatensaus",
            "description": "Door aubergines in de oven te roosteren worden ze heerlijk zacht. De balsamico maakt ze heerlijk zoet.",
            "allergenes": ["noten"],
            "cook": {
                "id": 2,
                "firstName": "John",
                "lastName": "Doe",
                "isActive": true,
                "emailAdress": "j.doe@server.com",
                "password": "secret",
                "phoneNumber": "06 12425475",
                "roles": ["editor", "guest"],
                "street": "",
                "city": ""
            },
            "participants": [
                {
                    "id": 2,
                    "firstName": "John",
                    "lastName": "Doe",
                    "isActive": true,
                    "emailAdress": "j.doe@server.com",
                    "password": "secret",
                    "phoneNumber": "06 12425475",
                    "roles": ["editor", "guest"],
                    "street": "",
                    "city": ""
                },
                {
                    "id": 4,
                    "firstName": "Marieke",
                    "lastName": "Van Dam",
                    "isActive": false,
                    "emailAdress": "m.vandam@server.nl",
                    "password": "secret",
                    "phoneNumber": "06-12345678",
                    "roles": ["editor", "guest"],
                    "street": "",
                    "city": ""
                }
            ]
        }
    ]
}
```

### Get meal by id

```
  GET /api/meal/:id
```

#### URL parameters

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `id`      | `number` | **Required** |

#### Response

```json
{
    "status": 201,
    "result": {
        "id": 37,
        "isActive": true,
        "isVega": true,
        "isVegan": true,
        "isToTakeHome": true,
        "dateTime": "2022-05-20T06:30:53.000Z",
        "maxAmountOfParticipants": 6,
        "price": "6.75",
        "imageUrl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
        "createDate": "2022-05-20T20:59:00.707Z",
        "updateDate": "2022-05-20T20:59:00.707Z",
        "name": "Spaghetti Bolognese",
        "description": "De pastaklassieker bij uitstek.",
        "allergenes": ["gluten", "noten"],
        "cook": {
            "id": 1,
            "firstName": "Klaas",
            "lastName": "Tilburg",
            "isActive": true,
            "emailAdress": "k.tilburg@holland.com",
            "password": "$2b$10$DU3728ri3QpXLbxTH3iBCOOtjwFDFGrSNOVQ4Ly8HMgK/HUHcCUrK",
            "phoneNumber": "0638719633",
            "roles": [],
            "street": "Hopstraat",
            "city": "Amsterdam"
        },
        "participants": [
            {
                "id": 1,
                "firstName": "Klaas",
                "lastName": "Tilburg",
                "isActive": true,
                "emailAdress": "k.tilburg@holland.com",
                "password": "$2b$10$DU3728ri3QpXLbxTH3iBCOOtjwFDFGrSNOVQ4Ly8HMgK/HUHcCUrK",
                "phoneNumber": "0638719633",
                "roles": [],
                "street": "Hopstraat",
                "city": "Amsterdam"
            }
        ]
    }
}
```

### Create meal

```
  POST /api/meal/
```

#### Header

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `token`   | `Bearer` | **Required** |

#### Request body

| Parameter                 | Type                 | Description  |
| :------------------------ | :------------------- | :----------: |
| `name`                    | `string`             | **Required** |
| `description`             | `string`             | **Required** |
| `isVega`                  | `boolean/number`     | **Required** |
| `isVegan`                 | `boolean/number`     | **Required** |
| `isToTakeHome`            | `boolean/number`     | **Required** |
| `dateTime`                | `string`             | **Required** |
| `imageUrl`                | `string`             | **Required** |
| `maxAmountOfParticipants` | `number`             | **Required** |
| `price`                   | `number`             | **Required** |
| `allergenes`              | `array (of strings)` | **Required** |

#### Response

```json
{
    "status": 201,
    "result": {
        "id": 37,
        "isActive": true,
        "isVega": true,
        "isVegan": true,
        "isToTakeHome": true,
        "dateTime": "2022-05-20T06:30:53.000Z",
        "maxAmountOfParticipants": 6,
        "price": "6.75",
        "imageUrl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
        "createDate": "2022-05-20T20:59:00.707Z",
        "updateDate": "2022-05-20T20:59:00.707Z",
        "name": "Spaghetti Bolognese",
        "description": "De pastaklassieker bij uitstek.",
        "allergenes": ["gluten", "noten"],
        "cook": {
            "id": 1,
            "firstName": "Klaas",
            "lastName": "Tilburg",
            "isActive": true,
            "emailAdress": "k.tilburg@holland.com",
            "password": "$2b$10$DU3728ri3QpXLbxTH3iBCOOtjwFDFGrSNOVQ4Ly8HMgK/HUHcCUrK",
            "phoneNumber": "0638719633",
            "roles": [],
            "street": "Hopstraat",
            "city": "Amsterdam"
        },
        "participants": [
            {
                "id": 1,
                "firstName": "Klaas",
                "lastName": "Tilburg",
                "isActive": true,
                "emailAdress": "k.tilburg@holland.com",
                "password": "$2b$10$DU3728ri3QpXLbxTH3iBCOOtjwFDFGrSNOVQ4Ly8HMgK/HUHcCUrK",
                "phoneNumber": "0638719633",
                "roles": [],
                "street": "Hopstraat",
                "city": "Amsterdam"
            }
        ]
    }
}
```

### Update meal

```
  PUT /api/meal/
```

#### Header

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `token`   | `Bearer` | **Required** |

#### URL parameters

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `id`      | `number` | **Required** |

#### Request body

| Parameter                 | Type                 | Description  |
| :------------------------ | :------------------- | :----------: |
| `name`                    | `string`             | **Required** |
| `description`             | `string`             | **Optional** |
| `isVega`                  | `boolean/number`     | **Optional** |
| `isVegan`                 | `boolean/number`     | **Optional** |
| `isToTakeHome`            | `boolean/number`     | **Optional** |
| `dateTime`                | `string`             | **Optional** |
| `imageUrl`                | `string`             | **Optional** |
| `maxAmountOfParticipants` | `number`             | **Required** |
| `price`                   | `number`             | **Required** |
| `allergenes`              | `array (of strings)` | **Optional** |

#### Response

```json
{
    "status": 201,
    "result": {
        "id": 37,
        "isActive": true,
        "isVega": true,
        "isVegan": true,
        "isToTakeHome": true,
        "dateTime": "2022-05-20T06:30:53.000Z",
        "maxAmountOfParticipants": 6,
        "price": "6.75",
        "imageUrl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
        "createDate": "2022-05-20T20:59:00.707Z",
        "updateDate": "2022-05-20T20:59:00.707Z",
        "name": "Spaghetti Bolognese",
        "description": "De pastaklassieker bij uitstek.",
        "allergenes": ["gluten", "noten"],
        "cook": {
            "id": 1,
            "firstName": "Klaas",
            "lastName": "Tilburg",
            "isActive": true,
            "emailAdress": "k.tilburg@holland.com",
            "password": "$2b$10$DU3728ri3QpXLbxTH3iBCOOtjwFDFGrSNOVQ4Ly8HMgK/HUHcCUrK",
            "phoneNumber": "0638719633",
            "roles": [],
            "street": "Hopstraat",
            "city": "Amsterdam"
        },
        "participants": [
            {
                "id": 1,
                "firstName": "Klaas",
                "lastName": "Tilburg",
                "isActive": true,
                "emailAdress": "k.tilburg@holland.com",
                "password": "$2b$10$DU3728ri3QpXLbxTH3iBCOOtjwFDFGrSNOVQ4Ly8HMgK/HUHcCUrK",
                "phoneNumber": "0638719633",
                "roles": [],
                "street": "Hopstraat",
                "city": "Amsterdam"
            }
        ]
    }
}
```

### Delete meal

```
  DELETE /api/meal/:id
```

#### Header

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `token`   | `Bearer` | **Required** |

#### URL parameters

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `id`      | `number` | **Required** |

#### Response

```json
{
    "status": 200,
    "message": "Meal has been deleted successfully."
}
```

### Meal participation

```
  GET /api/meal/:id/participate
```

#### Header

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `token`   | `Bearer` | **Required** |

#### URL parameters

| Parameter | Type     | Description  |
| :-------- | :------- | :----------: |
| `id`      | `number` | **Required** |

#### Response

```json
{
    "currentlyParticipating": true,
    "currentAmountOfParticipants": 3
}
```

#### or

```json
{
    "currentlyParticipating": false,
    "currentAmountOfParticipants": 2
}
```

#### depending on if you're already signed in for the meal occasion or not

## Running Tests

To run tests, run the following command

```bash
  npm run test
```

## License

This application is of free use for any open source project.

## FAQ

#### Why are the parameters _emailAdress_ and _allergenes_ spelled wrong?

This project is based on an API our teacher has made in the past. Unfortunately I had to write it the way he did. Otherwise the application wouldn't have survived the assertion tests they made.

## Support

For support, email mvdc2000@hotmail.nl and I'll answer your question as soon as possible.
