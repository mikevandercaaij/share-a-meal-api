const assert = require("assert");
const jwt = require("jsonwebtoken");
const dbconnection = require("./../../database/dbconnection");
// const validateEmail = require('../util/emailvalidator')
const jwtSecretKey = require("./../config/config").jwtSecretKey;

module.exports = {
    login(req, res, next) {
        dbconnection.getConnection((err, connection) => {
            if (err) {
                res.status(500).json({
                    message: err.toString(),
                });
            }
            if (connection) {
                // 1. Kijk of deze useraccount bestaat.
                connection.query("SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = ?", [req.body.emailAdress], (err, rows, fields) => {
                    connection.release();
                    if (err) {
                        res.status(500).json({
                            message: err.toString(),
                        });
                    }
                    if (rows) {
                        // 2. Er was een resultaat, check het password.
                        if (rows && rows.length === 1 && rows[0].password == req.body.password) {
                            // Extract the password from the userdata - we do not send that in the response.
                            const { password, ...userinfo } = rows[0];
                            // Create an object containing the data we want in the payload.
                            const payload = {
                                userId: userinfo.id,
                            };

                            jwt.sign(payload, jwtSecretKey, { expiresIn: "12d" }, function (err, token) {
                                res.status(200).json({
                                    status: 200,
                                    result: { ...userinfo, token },
                                });
                            });
                        } else {
                            res.status(404).json({
                                status: 404,
                                message: "User not found or password invalid",
                            });
                        }
                    }
                });
            }
        });
    },

    validateLogin(req, res, next) {
        // Verify that we receive the expected input
        try {
            assert(typeof req.body.emailAdress === "string", "Email must be a string");
            assert(typeof req.body.password === "string", "Password must be a string");
            next();
        } catch (ex) {
            res.status(400).json({
                status: 400,
                message: ex.message,
            });
        }
    },

    validateToken(req, res, next) {
        // The headers should contain the authorization-field with value 'Bearer [token]'
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                status: 401,
                message: "Authorization header missing!",
            });
        } else {
            // Strip the word 'Bearer ' from the headervalue
            const token = authHeader.substring(7, authHeader.length);

            jwt.verify(token, jwtSecretKey, (err, payload) => {
                if (err) {
                    res.status(401).json({
                        status: 401,
                        message: "Invalid token",
                    });
                }
                if (payload) {
                    req.userId = payload.userId;
                    next();
                }
            });
        }
    },
};
