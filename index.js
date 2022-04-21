//instantiate installed modules
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

//set port to either predefined server port or 3000 that can be used for local testing
const port = process.env.PORT || 3000;

//enable app to parse json
app.use(bodyParser.json());

//array that holds all user data
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
//id value will decide user id
let id = 0;

//get request on root
app.get("/", (req, res) => {
    //show response on home directory
    res.status(200).json({
        code: 200,
        message: 'This is my recreation of the Share-a-Meal api that has been used for the "Programmeren 3" Share-a-Meal application.',
        course: "Programmeren 4",
        author: "Mike van der Caaij",
        studentNumber: 2184147,
    });

    //end response process
    res.end();
});

//TODO:UC-201
//UC-201 Register as a new user
app.post("/user", (req, res) => {
    let user = req.body;
    id++;
    user = {
        id,
        ...user,
    };

    //boolean thats used to see if an email is already used
    let addUser = true;

    //check if given email is already in use
    database.forEach((el) => {
        if (el.emailAddress === user.emailAddress) {
            addUser = false;
        }
    });

    if (addUser) {
        //add user if the email is unique
        database.push(user);

        //return successful status + result
        res.status(201).json({
            status: 201,
            result: database,
        });
    } else {
        //return status + error message
        res.status(409).json({
            status: 409,
            message: `User with the email ${user.emailAddress} already exists.`,
        });
    }
});

//UC-202 Get all users
app.get("/user", (req, res) => {
    //if request if successful return all users
    res.status(200).json({
        status: res.statusCode,
        result: database,
    });

    //end response process
    res.end();
});

//UC-203 Request personal user profile
app.get("/user/profile", (req, res) => {
    //On successful get request, display json object showing functionality hasn't been added yet.
    res.status(200).json({
        code: 200,
        message: "This functionality has not been added yet.",
    });

    //end response process
    res.end();
});

//UC-204 Get single user by ID
app.get("/user/:id", (req, res) => {
    //save parameter (id) in variable
    const id = Number(req.params.id);

    //look for user with same id as given in the parameters
    let user = database.filter((item) => item.id === id);

    //check if user is in database
    if (user.length > 0) {
        res.status(200).json({
            status: 200,
            result: user,
        });
    } else {
        //if the user isn't found return a fitting error response
        res.status(404).json({
            status: 404,
            message: `User with an id of ${id} doesn't exist`,
        });
    }

    //end response process
    res.end();
});

//UC-205 Update a single user
app.put("/user/:id", (req, res) => {
    //save parameter (id) in variable
    const id = Number(req.params.id);

    //set user object with given request body
    let user = req.body;
    user = {
        id,
        ...user,
    };

    //filtered array with user that has the same id
    let existingUser = database.filter((item) => item.id === id);

    //check if there actually is a user in the filtered array
    if (existingUser.length > 0) {
        //get index of user in array
        userIndex = database.findIndex((obj) => obj.id === id);
        //use index to change object to new object
        database[userIndex] = user;
        //return successful status + updated user
        res.status(201).json({
            status: 201,
            message: "User has been updated successfully.",
            response: user,
        });
    } else {
        //if the user isn't found return a fitting error response
        res.status(404).json({
            status: 404,
            message: `Can't update user with an id of ${id} because it doesn't exist`,
        });
    }

    //end response process
    res.end();
});

//UC-206 Delete a user
app.delete("/user/:id", (req, res) => {
    //save parameter (id) in variable
    const id = Number(req.params.id);

    //look for user with same id as given in the parameters
    let user = database.filter((item) => item.id === id);

    if (user.length > 0) {
        //add all users to filtered array except for the user with the same id
        database = database.filter((item) => item.id !== id);
        //send successful status
        res.status(201).json({
            status: 201,
            message: "User has been successfully deleted.",
        });
    } else {
        //if the user isn't found return a fitting error response
        res.status(404).json({
            status: 404,
            message: `Can't delete user with an id of ${id} because it doesn't exist`,
        });
    }

    //end response process
    res.end();
});

//make server listen to given ports
app.listen(port, () => {
    console.log("Server running at " + port);
});
