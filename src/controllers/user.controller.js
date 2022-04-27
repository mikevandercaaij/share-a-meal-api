const assert = require("assert");
const { nextTick } = require("process");
const MailChecker = require("mailchecker");

//array that holds all user data
let database = [
    {
        id: 0,
        firstName: "Mike",
        lastName: "van der Caaij",
        street: "Gareelweg 11",
        city: "Heerle",
        isActive: true,
        emailAddress: "m.vandercaaij@student.avans.nl", //this email is already in use === user exists
        password: "geheim",
        phoneNumber: "06 38719633",
    },
];

//id value will decide user id
let id = 0;

//validate user
exports.validateUser = (req, res, next) => {
    const user = req.body;

    //localize all req body values
    let { firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = user;

    //check if all values are of a certain type
    try {
        assert(typeof firstName === "string", "First Name must be a string.");
        assert(typeof lastName === "string", "Last Name must be a string.");
        assert(typeof street === "string", "Street must be a string.");
        assert(typeof city === "string", "City Name must be a string.");
        assert(typeof isActive === "boolean", "isActive must be a string.");
        assert(typeof emailAddress === "string", "Email Address must be a string.");
        assert(typeof password === "string", "Password must be a string.");
        assert(typeof phoneNumber === "string", "Phone Number must be a string.");

        //check if email is valid
        assert(MailChecker.isValid(emailAddress), "Email is not valid.");

        //if so run next function
        return next();
    } catch (err) {
        //if not return error
        return next({
            status: 400,
            result: err.message,
        });
    }
};

//UC-201 Register as a new user
exports.addUser = (req, res, next) => {
    //put request body in a variable
    let user = req.body;

    //boolean thats used to see if an email is already used
    let addUser = true;

    //check if given email is already in use
    database.forEach((el) => {
        if (el.emailAddress === user.emailAddress) {
            addUser = false;
        }
    });

    if (addUser) {
        //increment id so it's always unique
        id++;

        //make user object from request body
        user = {
            id,
            ...user,
        };

        //add user if the email is unique
        database.push(user);

        //return successful status + result
        res.status(201).json({
            status: 201,
            result: database,
        });
    } else {
        //return status + error message
        return next({
            status: 409,
            message: `User with the email ${user.emailAddress} already exists.`,
        });
    }
};

//UC-202 Get all users
exports.getAllUsers = (req, res) => {
    //if request if successful return all users
    res.status(200).json({
        status: res.statusCode,
        result: database,
    });

    //end response process
    res.end();
};

//UC-203 Request personal user profile
exports.getUserProfile = (req, res) => {
    //On successful get request, display json object showing functionality hasn't been added yet.
    res.status(200).json({
        code: 200,
        message: "This functionality has not been added yet.",
    });

    //end response process
    res.end();
};

//UC-204 Get single user by ID
exports.getUserByID = (req, res, next) => {
    //save parameter (id) in variable
    const id = Number(req.params.id);

    //check if parameter is a number
    if (isNaN(id)) {
        return next();
    }

    //look for user with same id as given in the parameters
    let user = database.filter((item) => item.id === id);

    // check if user is in database
    if (user.length > 0) {
        //return successful status + result
        res.status(200).json({
            status: 200,
            result: user,
        });
    } else {
        //if the user isn't found return a fitting error response
        return next({
            status: 404,
            message: `User with an id of ${id} doesn't exist`,
        });
    }

    //end response process
    res.end();
};

//UC-205 Update a single user
exports.updateUser = (req, res, next) => {
    //save parameter (id) in variable
    const id = Number(req.params.id);

    //check if parameter is a number
    if (isNaN(id)) {
        return next();
    }

    //set user object with given request body
    let user = req.body;

    //make user object from request body
    user = {
        id,
        ...user,
    };

    //filtered array with user that has the same id
    let existingUser = database.filter((item) => item.id === id);

    //check if there actually is a user in the filtered array
    if (existingUser.length > 0) {
        //if (altered) email isn't already taken by another user the changes will be accepted
        let acceptChanges = true;

        //make filtered array of all users except current one
        const otherUsers = database.filter((item) => item.id !== id);

        //check if (altered) email is already in use by someone else
        otherUsers.forEach((el) => {
            if (el.emailAddress === user.emailAddress) {
                acceptChanges = false;
            }
        });

        if (acceptChanges) {
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
            //return false status if email is already in use by another user
            return next({
                status: 409,
                message: `Altered email (${user.emailAddress}) is already in use by another user.`,
            });
        }
    } else {
        //if the user isn't found return a fitting error response
        return next({
            status: 404,
            message: `Can't update user with an id of ${id} because it doesn't exist`,
        });
    }

    //end response process
    res.end();
};

//UC-206 Delete a user
exports.deleteUser = (req, res, next) => {
    //save parameter (id) in variable
    const id = Number(req.params.id);

    //check if parameter is a number
    if (isNaN(id)) {
        return next();
    }

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
        return next({
            status: 404,
            message: `Can't delete user with an id of ${id} because it doesn't exist`,
        });
    }

    //end response process
    res.end();
};
