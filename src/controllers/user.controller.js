const assert = require("assert");
const dbconnection = require("../../database/dbconnection");
const MailChecker = require("mailchecker");

//validate user
exports.validateUser = (req, res, next) => {
    const user = req.body;

    //localize all req body values
    let { firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber } = user;

    //check if all values are of a certain type
    try {
        assert(typeof firstName === "string", "First Name must be a string.");
        assert(typeof lastName === "string", "Last Name must be a string.");
        assert(typeof street === "string", "Street must be a string.");
        assert(typeof city === "string", "City Name must be a string.");
        assert(typeof isActive === "boolean", "isActive must be a string.");
        assert(typeof emailAdress === "string", "Email Address must be a string.");
        assert(typeof password === "string", "Password must be a string.");
        assert(typeof phoneNumber === "string", "Phone Number must be a string.");

        //check if email is valid
        assert(MailChecker.isValid(emailAdress), "Email is not valid.");

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
    dbconnection.getConnection((err, connection) => {
        if (err) throw err;

        //put request body in a variable
        const { firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city } = req.body;

        //boolean thats used to see if an email is already used
        let addUser = false;

        //store all users
        let allUsers;

        connection.query("SELECT COUNT(emailAdress) as count FROM user WHERE emailAdress = ?", emailAdress, function (error, results, fields) {
            if (err) throw err;
            const count = results[0].count;

            if (count === 0) {
                console.log(count);
                addUser = true;
            }

            if (addUser) {
                //insert new user into users
                connection.query("INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city) VALUES (?, ?, ?, ?, ?, ?, ?)", [firstName, lastName, emailAdress, password, phoneNumber, street, city], (error, results, fields) => {
                    if (error) throw error;

                    //get all users (including the newly added one)
                    connection.query("SELECT * FROM user", (error, results, fields) => {
                        if (error) throw error;
                        connection.release();
                        allUsers = results;

                        //return successful status + result
                        res.status(201).json({
                            status: 201,
                            result: allUsers,
                        });
                    });
                });
            } else {
                //return status + error message
                return next({
                    status: 409,
                    message: `User with the email ${emailAdress} already exists.`,
                });
            }
            //end response process
            res.end();
        });
    });
};

//UC-202 Get all users
exports.getAllUsers = (req, res) => {
    dbconnection.getConnection((err, connection) => {
        if (err) throw err;

        connection.query("SELECT * FROM user", (error, results, fields) => {
            connection.release();

            if (error) throw error;

            //send back all results
            res.status(200).json({
                status: 200,
                result: results,
            });

            //end response process
            res.end();
        });
    });
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

    dbconnection.getConnection((err, connection) => {
        if (err) throw err;
        connection.query("SELECT * FROM user WHERE id = ?", id, function (error, results, fields) {
            if (err) throw err;

            if (results.length > 0) {
                //return successful status + result
                res.status(200).json({
                    status: 200,
                    result: results[0],
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
        });
    });
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
            if (el.emailAdress === user.emailAdress) {
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
                message: `Altered email (${user.emailAdress}) is already in use by another user.`,
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
