const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");

app.use(bodyParser.json());

let database = [
    {
        id: 0,
        firstName: "Mike",
        lastName: "van der Caaij",
        street: "Gareelweg 11",
        isActive: true,
        emailAddress: "m.vandercaaij@student.avans.nl",
        password: "secret",
        phoneNumber: "06 38719633",
    },
];
let id = 0;

const users = [
    {
        id: 0,
        firstName: "Mike",
        lastName: "van der Caaij",
        street: "Gareelweg 11",
        isActive: true,
        emailAddress: "m.vandercaaij@student.avans.nl",
        password: "secret",
        phoneNumber: "06 38719633",
    },
    {
        id: 1,
        firstName: "Grover",
        lastName: "Armstrong",
        street: "Angelo Creek",
        isActive: true,
        emailAddress: "grover.armstrong@email.com",
        password: "jB37ohRnwA",
        phoneNumber: "+385 350.269.2224 x67265",
    },
    {
        id: 2,
        firstName: "Lane",
        lastName: "Johns",
        street: "Annabel Ports",
        isActive: true,
        emailAddress: "lane.johns@email.com",
        password: "ZCIWpBG8oF",
        phoneNumber: "+56 121-238-1548 x4149",
    },
    {
        id: 3,
        firstName: "Eddy",
        lastName: "Raynor",
        street: "Sipes Ports",
        isActive: true,
        emailAddress: "eddy.raynor@email.com",
        password: "lkquiADLNK",
        phoneNumber: "+223 (446) 641-7812 x238",
    },
    {
        id: 4,
        firstName: "Burt",
        lastName: "White",
        street: "Buckridge Land",
        isActive: true,
        emailAddress: "burt.white@email.com",
        password: "8MRWaLs6K5",
        phoneNumber: "+298 330-640-3450",
    },
];

//get request on root
app.get("/", (req, res) => {
    let result;
    if (res.statusCode >= 200 && res.statusCode <= 299) {
        result = {
            code: 200,
            message: "Hello World",
        };
    } else {
        result = {
            code: res.statusCode,
            message: "Something went terribly wrong",
        };
    }

    res.status();
    res.write(JSON.stringify(result));
    res.send();
    res.end();
});

//UC-201 Register as a new user
app.post("/user", (req, res) => {
    // if (res.statusCode >= 200 && res.statusCode <= 299) {
    //     res.status(res.statusCode).json({
    //         status: res.statusCode,
    //         result: "User created!",
    //     });
    // } else {
    //     res.send("Forbidden.");
    // }
    // res.end();
    let user = req.body;
    console.log(user);
    id++;
    user = {
        id,
        ...user,
    };
    database.push(user);
    console.log(database);
    res.status(201).json({
        status: 201,
        result: database,
    });
});

//UC-202 Get all users
app.get("/user", (req, res) => {
    if (res.statusCode >= 200 && res.statusCode <= 299) {
        res.status(200).json({
            status: res.statusCode,
            result: database,
        });
    } else {
        res.send("Unauthorized. You need to create a new user first, and login, to get a valid JWT.");
    }
    res.end();
});

//UC-203 Request personal user profile
app.get("/user/profile", (req, res) => {
    const id = Math.floor(Math.random() * users.length);

    if (res.statusCode >= 200 && res.statusCode <= 299) {
        if (id >= 0 && id <= users.length - 1) {
            res.send(JSON.stringify(users[id]));
        } else {
            res.send("User doesn't exist.");
        }
    } else {
        res.send("Forbidden.");
    }
    res.end();
});

//UC-204 Get single user by ID
app.get("/user/:id", (req, res) => {
    const id = Number(req.params.id);
    let user = database.filter((item) => item.id === id);

    if (user.length > 0) {
        res.status(200).json({
            status: 200,
            result: user,
        });
    } else {
        res.status(404).json({
            status: 404,
            result: `User with ID ${id} not found`,
        });
    }

    // if (res.statusCode >= 200 && res.statusCode <= 299) {
    //     if (id >= 0 && id <= users.length - 1) {
    //         res.send(JSON.stringify(users[id]));
    //     } else {
    //         res.send("User doesn't exist.");
    //     }
    // } else if (res.statusCode === 403) {
    //     res.send("Forbidden, no access");
    // } else {
    //     res.send("Forbidden.");
    // }
    // res.end();
});

//UC-205 Update a single user
app.put("/user/:id", (req, res) => {
    const id = req.params.id;
    if (res.statusCode >= 200 && res.statusCode <= 299) {
        if (id >= 0 && id <= users.length - 1) {
            res.send("User updated!");
        } else {
            res.send("User doesn't exist.");
        }
    } else if (res.statusCode === 400) {
        res.send("Not allowed to edit");
    } else {
        res.send("Forbidden.");
    }
    res.end();
});

//UC-206 Delete a user
app.delete("/user/:id", (req, res) => {
    const id = req.params.id;

    if (res.statusCode >= 200 && res.statusCode <= 299) {
        if (id >= 0 && id <= users.length - 1) {
            res.send("User deleted!");
        } else {
            res.send("User doesn't exist.");
        }
    } else if (res.statusCode === 400) {
        res.send("Not allowed to delete");
    } else {
        res.send("Forbidden.");
    }
    res.end();
});

//make server listen to given ports
app.listen(port, () => {
    console.log("Server running at " + port);
});
