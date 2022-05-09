const assert = require("assert");
const dbconnection = require("../../database/dbconnection");
const MailChecker = require("mailchecker");
const { passwordStrength } = require("check-password-strength");
const { phone } = require("phone");

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
        assert(typeof isActive === "boolean" || typeof isActive === "number", "isActive must be a boolean or number.");
        assert(typeof emailAdress === "string", "Email Address must be a string.");
        assert(typeof password === "string", "Password must be a string.");
        assert(typeof phoneNumber === "string", "Phone Number must be a string.");

        //check if password is valid
        let goodPassword = false;
        switch (passwordStrength(password).value) {
            case "Medium":
                goodPassword = true;
                break;
            case "Strong":
                goodPassword = true;
                break;
        }
        assert(goodPassword, "Password's strength is weak. Please fill in a stronger one!");

        //check if email is valid
        assert(MailChecker.isValid(emailAdress), "Email is not valid.");

        //validate phone number
        assert(phone(phoneNumber, { validateMobilePrefix: false }).isValid, "Phone number is invalid.");

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
    //create connection to database
    dbconnection.getConnection((err, connection) => {
        //throw error if something went wrong
        if (err) throw err;

        //put request body in a variable
        const { firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city } = req.body;

        connection.query("SELECT COUNT(emailAdress) as count FROM user WHERE emailAdress = ?", emailAdress, (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            //boolean thats used to see if an email is already used
            let addUser = false;

            //store count of
            const count = results[0].count;

            //if the email is unique register user
            if (count === 0) {
                addUser = true;
            }

            if (addUser) {
                //insert new user into users
                connection.query("INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city) VALUES (?, ?, ?, ?, ?, ?, ?)", [firstName, lastName, emailAdress, password, phoneNumber, street, city], (err, results, fields) => {
                    //throw error if something went wrong
                    if (err) throw err;

                    //get user
                    connection.query("SELECT * FROM user WHERE emailAdress = ?", emailAdress, (err, results, fields) => {
                        //throw error if something went wrong
                        if (err) throw err;

                        //close connection
                        connection.release();

                        //return successful status + results
                        res.status(201).json({
                            status: 201,
                            result: results,
                        });

                        //end response process
                        res.end();
                    });
                });
            } else {
                //return status + error message
                return next({
                    status: 409,
                    message: `User with the email ${emailAdress} already exists.`,
                });
            }
        });
    });
};

//UC-202 Get all users
exports.getAllUsers = (req, res) => {
    //create connection to database
    dbconnection.getConnection((err, connection) => {
        //throw error if something went wrong
        if (err) throw err;

        //get all users
        connection.query("SELECT * FROM user", (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            //close connection
            connection.release();

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
        status: 200,
        message: "This functionality has not been added yet.",
    });

    //end response process
    res.end();
};

//UC-204 Get single user by ID
exports.getUserByID = (req, res, next) => {
    dbconnection.getConnection((err, connection) => {
        //throw error if something went wrong
        if (err) throw err;

        //save parameter (id) in variable
        const id = Number(req.params.id);

        //check if parameter is a number
        if (isNaN(id)) {
            return next();
        }

        //get requested user's data
        connection.query("SELECT * FROM user WHERE id = ?", id, (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            //show data if user exists
            if (results.length > 0) {
                //return successful status + result
                res.status(200).json({
                    status: 200,
                    result: results[0],
                });

                //end response process
                res.end();
            } else {
                //if the user isn't found return a fitting error response
                return next({
                    status: 404,
                    message: `User with an id of ${id} doesn't exist`,
                });
            }
        });
    });
};

//UC-205 Update a single user
exports.updateUser = (req, res, next) => {
    //create connection
    dbconnection.getConnection((err, connection) => {
        //throw error if something went wrong
        if (err) throw err;

        //save parameter (id) in variable
        const id = Number(req.params.id);

        //check if parameter is a number
        if (isNaN(id)) {
            return next();
        }

        //set user object with given request body
        let user = req.body;

        connection.query("SELECT COUNT(id) as count FROM user WHERE id = ?", id, (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            //store query output either 0 or 1
            const userFound = results[0].count;

            //if user exists
            if (userFound) {
                connection.query("SELECT COUNT(emailAdress) as count FROM user WHERE emailAdress = ? AND id <> ?", [user.emailAdress, id], (err, results, fields) => {
                    //throw error if something went wrong
                    if (err) throw err;

                    //store if email is valid or not, can either be 0 or 1
                    const unValidEmail = results[0].count;

                    if (!unValidEmail) {
                        //put request body in a variable
                        const { firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city } = req.body;

                        //update user
                        connection.query("UPDATE user SET firstName = ?, lastName = ?, emailAdress = ?, password = ?, phoneNumber = ?, street = ?, city = ? WHERE ID = ?", [firstName, lastName, emailAdress, password, phoneNumber, street, city, id], (err, results, fields) => {
                            //throw error if something went wrong
                            if (err) throw err;

                            //close connection
                            connection.release();

                            //return successful status + updated user
                            res.status(201).json({
                                status: 201,
                                result: user,
                            });

                            //end response process
                            res.end();
                        });
                    } else {
                        //return false status if email is already in use by another user
                        return next({
                            status: 409,
                            message: `Altered email (${user.emailAdress}) is already in use by another user.`,
                        });
                    }
                });
            } else {
                //if the user isn't found return a fitting error response
                return next({
                    status: 404,
                    message: `Can't update user with an id of ${id} because it doesn't exist`,
                });
            }
        });
    });
};

//UC-206 Delete a user
exports.deleteUser = (req, res, next) => {
    //save parameter (id) in variable
    const id = Number(req.params.id);

    //check if parameter is a number
    if (isNaN(id)) {
        return next();
    }

    //create connection
    dbconnection.getConnection((err, connection) => {
        //throw error if something went wrong
        if (err) throw err;

        connection.query("DELETE FROM user WHERE id = ?", id, (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            //close connection
            connection.release();

            //if a row has been deleted
            if (results.affectedRows === 1) {
                //send successful status
                res.status(201).json({
                    status: 201,
                    message: "User has been deleted successfully.",
                });

                //end response process
                res.end();
            } else {
                //if the user isn't found return a fitting error response
                return next({
                    status: 404,
                    message: `Can't delete user with an id of ${id} because it doesn't exist`,
                });
            }
        });
    });
};
