const jwt = require("jsonwebtoken");
const dbconnection = require("../../database/dbconnection");

// const privateKey = "secret";

// jwt.sign({ userId: 1 }, privateKey, { algorithm: "RS256" }, (err, token) => {
//     if (err) console.log(err);
//     if (token) console.log(token);
// });

exports.login = (req, res, next) => {
    //add asserts beforehands (routes)

    const queryString = "SELECT id, firstName, lastName, emailAdress, password FROM user WHERE emailAdress = ?";

    const { emailAdress, password } = req.body;

    console.log(req.body);

    dbconnection.getConnection(queryString, emailAdress, (err, results, fields) => {
        if (err) throw err;

        if (results && results.length === 1) {
            //user found with current email
            if (results[0].password === password) {
                res.status(200).json({
                    code: 200,
                    result: results[0],
                });
            }
        } else {
            res.status(404).json({
                code: 404,
                message: "User not found",
            });
        }
    });
};
