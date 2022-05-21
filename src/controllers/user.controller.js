const assert = require("assert");
const dbconnection = require("./../../database/dbconnection");
const bcrypt = require("bcrypt");
const { query } = require("./../../database/dbconnection");

//validate user when it's being created
exports.validateUserCreate = (req, res, next) => {
    //localize all req body values
    const { firstName, lastName, emailAdress, password, street, city, phoneNumber } = req.body;

    //check if all values are of a certain type
    try {
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const passwordRegex = /^(?=.*?[A-Z])(?=.*?[0-9]).{8,}$/;
        const phoneNumberRegex = /([\d] *){10}/;

        assert(typeof firstName === "string", "First Name must be a string.");
        assert(typeof lastName === "string", "Last Name must be a string.");
        assert(typeof emailAdress === "string", "Email Address must be a string.");
        assert(typeof password === "string", "Password must be a string.");
        assert(typeof phoneNumber === "string", "PhoneNumber must be a string.");
        assert(typeof street === "string", "Street must be a string.");
        assert(typeof city === "string", "City Name must be a string.");

        //validate email, password, phonenumber
        assert(emailAdress.match(emailRegex), "Email is not valid.");
        assert(password.match(passwordRegex), "Password must contain 1 capital, 1 special letter and at least 8 characters.");
        assert(phoneNumber.match(phoneNumberRegex), "PhoneNumber is not valid.");

        return next();
    } catch (err) {
        //if not return error
        return next({
            status: 400,
            message: err.message,
        });
    }
};

//validate user when it's being created
exports.validateUserUpdate = (req, res, next) => {
    //localize all req body values
    const { firstName, lastName, emailAdress, password, street, city, phoneNumber } = req.body;

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[0-9]).{8,}$/;
    const phoneNumberRegex = /([\d] *){10}/;

    //check if all values are of a certain type
    try {
        if (firstName) {
            assert(typeof firstName === "string", "First Name must be a string.");
        }

        if (lastName) {
            assert(typeof lastName === "string", "Last Name must be a string.");
        }

        assert(typeof emailAdress === "string", "Email Address must be a string.");
        assert(emailAdress.match(emailRegex), "Email is not valid.");

        if (password) {
            assert(typeof password === "string", "Password must be a string.");
            assert(password.match(passwordRegex), "Password must contain 1 capital, 1 special letter and at least 8 characters.");
        }

        if (phoneNumber) {
            assert(typeof phoneNumber === "string", "phoneNumber must be a string.");
            assert(phoneNumber.match(phoneNumberRegex), "PhoneNumber is not valid.");
        }

        if (street) {
            assert(typeof street === "string", "Street must be a string.");
        }

        if (city) {
            assert(typeof city === "string", "City Name must be a string.");
        }

        return next();
    } catch (err) {
        //if not return error
        return next({
            status: 400,
            message: err.message,
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
        const { firstName, lastName, emailAdress, password, street, city, phoneNumber } = req.body;

        connection.query("SELECT COUNT(emailAdress) as count FROM user WHERE emailAdress = ?", emailAdress, (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            //boolean thats used to see if an email is already used
            let addUser = false;

            //if the email is unique register user
            if (results[0].count === 0) {
                addUser = true;
            }

            if (addUser) {
                let queryString = "INSERT INTO user (firstName, lastName, emailAdress, password, street, city, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?)";
                let insertArray = [firstName, lastName, emailAdress, exports.encryptPassword(password), street, city, phoneNumber];

                //insert new user into users
                connection.query(queryString, insertArray, (err, results, fields) => {
                    //throw error if something went wrong
                    if (err) throw err;

                    //get user
                    connection.query("SELECT * FROM user WHERE emailAdress = ?", emailAdress, (err, results, fields) => {
                        //throw error if something went wrong
                        if (err) throw err;

                        //close connection
                        connection.release();

                        //return successful status + result
                        res.status(201).json({
                            status: 201,
                            result: exports.formatUser(results),
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
exports.getAllUsers = (req, res, next) => {
    //create connection to database
    dbconnection.getConnection((err, connection) => {
        //throw error if something went wrong
        if (err) throw err;

        let { isActive, firstName, limit, lastName, emailAdress, street, city, phoneNumber } = req.query;

        let queryString = "SELECT * FROM user";

        if (isActive || firstName || limit || lastName || emailAdress || street || city || phoneNumber) {
            let count = 0;

            if (isActive || firstName || lastName || emailAdress || street || city || phoneNumber) {
                queryString += " WHERE ";
            }

            if (isActive) {
                queryString += `isActive = ${isActive}`;
                count++;
            }

            if (firstName) {
                if (count === 1) {
                    queryString += " AND ";
                }
                count++;
                queryString += `firstName = "${firstName}"`;
            }

            if (lastName) {
                if (count === 1) {
                    queryString += " AND ";
                }
                count++;
                queryString += `lastName = "${lastName}"`;
            }

            if (emailAdress) {
                if (count === 1) {
                    queryString += " AND ";
                }
                count++;
                queryString += `emailAdress = "${emailAdress}"`;
            }

            if (street) {
                if (count === 1) {
                    queryString += " AND ";
                }
                count++;
                queryString += `street = "${street}"`;
            }

            if (city) {
                if (count === 1) {
                    queryString += " AND ";
                }
                count++;
                queryString += `city = "${city}"`;
            }

            if (phoneNumber) {
                if (count === 1) {
                    queryString += " AND ";
                }
                count++;
                queryString += `phoneNumber = "${phoneNumber}"`;
            }

            if (limit) {
                queryString += ` LIMIT ${limit}`;
            }

            if (count > 2) {
                return next({
                    status: 400,
                    message: "Maximum amount of parameters (2) has been surpassed.",
                });
            }
        }
        //get all users
        connection.query(queryString, (err, results, fields) => {
            //throw error if something went wrong
            if (err) next();

            //close connection
            connection.release();

            //send back all results
            res.status(200).json({
                status: 200,
                result: exports.formatUser(results),
            });

            //end response process
            res.end();
        });
    });
};

//UC-203 Request personal user profile
exports.getUserProfile = (req, res) => {
    const id = req.userId;

    dbconnection.getConnection((err, connection) => {
        if (err) throw err;
        connection.query("SELECT * FROM user WHERE id = ?", id, (err, results, fields) => {
            if (err) throw err;

            connection.release();

            res.status(200).json({
                status: 200,
                result: exports.formatUser(results),
            });

            //end response process
            res.end();
        });
    });
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
                if (id !== req.userId) {
                    delete results[0].password;
                }

                //return successful status + result
                res.status(200).json({
                    status: 200,
                    result: exports.formatUser(results),
                });

                //end response process
                res.end();
            } else {
                //if the user isn't found return a fitting error response
                return next({
                    status: 404,
                    message: `User does not exist`,
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

        const newUser = req.body;

        //check if parameter is a number
        if (isNaN(id)) {
            return next();
        }

        //set user object with given request body
        let user = req.body;

        connection.query("SELECT * FROM user WHERE id = ?", id, (err, results, fields) => {
            //throw error if something went wrong
            if (err) throw err;

            //store old data
            const oldUser = results[0];

            //if user exists
            if (results[0]) {
                connection.query("SELECT COUNT(emailAdress) as count FROM user WHERE emailAdress = ? AND id <> ?", [user.emailAdress, id], (err, results, fields) => {
                    //throw error if something went wrong
                    if (err) throw err;

                    if (req.userId !== id) {
                        res.status(403).json({
                            status: 403,
                            message: "You can't update this account because it isn't yours",
                        });
                    }

                    //store if email is valid or not, can either be 0 or 1
                    const unValidEmail = results[0].count;

                    if (!unValidEmail) {
                        //put request body in a variable

                        const user = {
                            ...oldUser,
                            ...newUser,
                        };

                        //encrypt password
                        user.password = exports.encryptPassword(user.password);

                        const { firstName, lastName, emailAdress, password, phoneNumber, street, city } = user;
                        let updateArray = [];
                        let queryString = "UPDATE user SET";

                        if (firstName) {
                            updateArray.push(firstName);
                            queryString += " firstName = ?,";
                        }

                        if (lastName) {
                            updateArray.push(lastName);
                            queryString += " lastName = ?,";
                        }

                        if (emailAdress) {
                            updateArray.push(emailAdress);
                            queryString += " emailAdress = ?,";
                        }

                        if (password) {
                            updateArray.push(password);
                            queryString += " password = ?,";
                        }

                        if (phoneNumber) {
                            updateArray.push(phoneNumber);
                            queryString += " phoneNumber = ?,";
                        }

                        if (street) {
                            updateArray.push(street);
                            queryString += " street = ?,";
                        }

                        if (city) {
                            updateArray.push(city);
                            queryString += " city = ?,";
                        }

                        updateArray.push(id);
                        queryString = queryString.slice(0, -1) + " WHERE id = ?";

                        //update user
                        connection.query(queryString, updateArray, (err, results, fields) => {
                            //throw error if something went wrong
                            if (err) throw err;

                            //close connection
                            connection.release();

                            //return successful status + updated user
                            res.status(200).json({
                                status: 200,
                                result: exports.formatUser([user]),
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
                    status: 400,
                    message: "User does not exist",
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

        connection.query("SELECT COUNT(id) as count FROM user WHERE id = ?", id, (err, results, fields) => {
            if (err) throw err;

            if (!results[0].count) {
                //if the user isn't found return a fitting error response
                return next({
                    status: 400,
                    message: `User does not exist`,
                });
            } else {
                if (req.userId === id) {
                    connection.query("DELETE FROM user WHERE id = ?", id, (err, results, fields) => {
                        //throw error if something went wrong
                        if (err) throw err;

                        //close connection
                        connection.release();

                        //if a row has been deleted
                        if (results.affectedRows === 1) {
                            //send successful status
                            res.status(200).json({
                                status: 200,
                                message: "User has been deleted successfully.",
                            });

                            //end response process
                            res.end();
                        } else {
                            //if no rows have been affected, return fitting error (very unlikely)
                            return next({
                                status: 409,
                                message: "No user has been deleted",
                            });
                        }
                    });
                } else {
                    res.status(403).json({
                        status: 403,
                        message: "You can't delete this account because it isn't yours",
                    });
                }
            }
        });
    });
};
exports.formatUser = (results) => {
    if (results.length > 0) {
        results.forEach((result) => {
            if (result.isActive === 1) {
                result.isActive = true;
            } else {
                result.isActive = false;
            }

            if (result.roles === "") {
                result.roles = [];
            }

            if (typeof result.roles === "string") {
                result.roles = result.roles.split(",");
            }
        });
    }

    if (results.length === 1) {
        return results[0];
    }
    return results;
};

exports.encryptPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
};

exports.comparePassword = (currentPassword, databasePassword) => {
    return bcrypt.compareSync(currentPassword, databasePassword);
};
