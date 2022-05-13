process.env.DB_DATABASE = process.env.DB_DATABASE || "share-a-meal-testdb";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("./../../index");
const dbconnection = require("./../../database/dbconnection");
const jwt = require("jsonwebtoken");
const { jwtSecretKey } = require("./../../src/config/config");

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;
const INSERT_USER = "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" + '(1, "first", "last", "test@server.nl", "secret", "street", "city");';
const INSERT_SECOND_USER = "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" + '(2, "first2", "last2", "test2@server.nl", "secret", "street2", "city2");';

// UC-201 Register as new user
describe("UC-201 Register as new user - POST /api/user", () => {
    before((done) => {
        dbconnection.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(CLEAR_DB + INSERT_USER, (err, results, fields) => {
                if (err) throw err;
                connection.release();
                done();
            });
        });
    });
    it("TC-201-1 Required input is missing", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
                //firstName missing
                lastName: "van der Caaij",
                street: "Gareelweg 11",
                city: "Heerle",
                isActive: true,
                emailAddress: "m.vandercaaij@student.avans.nl",
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: "06 38719633",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(400);
                message.should.be.a("string").that.equals("First Name must be a string.");
                done();
            });
    });
    it("TC-201-2 Non valid Email Address", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
                firstName: "Klaas",
                lastName: "Tilburg",
                isActive: true,
                emailAdress: 2, //TODO: change when regex is added
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: "0612345678",
                roles: "editor,guest",
                street: "Hopstraat",
                city: "Amsterdam",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(400);
                message.should.be.a("string").that.equals("Email Address must be a string.");
                done();
            });
    });
    it("TC-201-3 Non valid Password", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
                firstName: "Klaas",
                lastName: "Tilburg",
                isActive: true,
                emailAdress: "ts.dsadas",
                password: 2, //TODO: change when regex is added
                phoneNumber: "0612345678",
                roles: "editor,guest",
                street: "Hopstraat",
                city: "Amsterdam",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(400);
                message.should.be.a("string").that.equals("Password must be a string.");
                done();
            });
    });
    it("TC-201-4 User already exists", (done) => {
        chai.request(server)
            .post("/api/user")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send({
                firstName: "Klaas",
                lastName: "Tilburg",
                isActive: true,
                emailAdress: "test@server.nl", //email that exists
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: "0612345678",
                roles: "editor,guest",
                street: "Hopstraat",
                city: "Amsterdam",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(409);
                message.should.be.a("string").that.equals("User with the email test@server.nl already exists.");
                done();
            });
    });
    it("TC-201-5 User has been registered succesfully", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
                firstName: "Mike",
                lastName: "van der Caaij",
                street: "Gareelweg 11",
                city: "Heerle",
                isActive: true,
                emailAdress: "m.vandercaaij@student.avans.nl",
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: "06 38719633",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(201);
                result.should.be.an("object");
                result.should.have.property("id");
                result.should.have.property("firstName");
                result.should.have.property("lastName");
                result.should.have.property("isActive");
                result.should.have.property("emailAdress");
                result.should.have.property("password");
                result.should.have.property("phoneNumber");
                result.should.have.property("roles");
                result.should.have.property("street");
                result.should.have.property("city");
                done();
            });
    });
});

// UC-202 Overview of users
describe("UC-202 Overview of users - GET /api/user", () => {
    before((done) => {
        dbconnection.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(CLEAR_DB + INSERT_USER + INSERT_SECOND_USER, (err, results, fields) => {
                if (err) throw err;
                connection.release();
                done();
            });
        });
    });
    it("TC-202-1 Show zero users", (done) => {
        chai.request(server)
            .get("/api/user?limit=0")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .end((req, res) => {
                let { status, result } = res.body;
                res.body.should.be.an("object");
                status.should.equals(200);
                result.should.be.an("array");
                result.should.have.length(0);
                done();
            });
    });
    it("TC-202-2 Show two users", (done) => {
        chai.request(server)
            .get("/api/user?limit=2")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(200);
                result.should.be.an("array");
                result.should.have.length(2);
                done();
            });
    });
    it("TC-202-3 Show users using a searchterm with non-existing name", (done) => {
        chai.request(server)
            .get("/api/user?firstName=test")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .end((req, res) => {
                let { status, result } = res.body;
                res.body.should.be.an("object");
                status.should.equals(200);
                result.should.be.an("array");
                result.should.have.length(0);
                done();
            });
    });
    it("TC-202-5 Show users using a searchterm with isActive status of false", (done) => {
        chai.request(server)
            .get("/api/user?isActive=false")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(200);
                result.should.be.an("array");
                result.should.have.length(0);
                done();
            });
    });
    it("TC-202-5 Show users using a searchterm with isActive status of true", (done) => {
        chai.request(server)
            .get("/api/user?isActive=true")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(200);
                result.should.be.an("array");
                result.should.have.length(2);
                done();
            });
    });
    it("TC-202-6 Show users using a searchterm with existing name", (done) => {
        chai.request(server)
            .get("/api/user?firstName=first")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(200);
                result.should.be.an("array");
                result.should.have.length(1);
                done();
            });
    });
});
//
// // UC-203 Get users profile
describe("UC-203 Get users profile - GET /api/user/profile", () => {
    before((done) => {
        dbconnection.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(CLEAR_DB + INSERT_USER, (err, results, fields) => {
                if (err) throw err;
                connection.release();
                done();
            });
        });
    });
    it("TC-203-1 Invalid token", (done) => {
        chai.request(server)
            .get("/api/user/profile")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, "test"))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(401);
                message.should.be.a("string").that.equals("Invalid token");
                done();
            });
    });
    it("TC-203-2 Valid token and user exists", (done) => {
        chai.request(server)
            .get("/api/user/profile")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(200);
                result.should.be.an("object");
                result.should.have.property("id");
                result.should.have.property("firstName");
                result.should.have.property("lastName");
                result.should.have.property("isActive");
                result.should.have.property("emailAdress");
                result.should.have.property("password");
                result.should.have.property("phoneNumber");
                result.should.have.property("roles");
                result.should.have.property("street");
                result.should.have.property("city");
                done();
            });
    });
});

// UC-204 Get user details
describe("UC-204 Get user details - GET /api/user/:id", () => {
    before((done) => {
        dbconnection.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(CLEAR_DB + INSERT_USER, (err, results, fields) => {
                if (err) throw err;
                connection.release();
                done();
            });
        });
    });
    it("TC-204-1 Invalid token", (done) => {
        chai.request(server)
            .get("/api/user/1")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, "test"))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(401);
                message.should.be.a("string").that.equals("Invalid token");
                done();
            });
    });
    it("TC-204-2 User ID doesn't exists", (done) => {
        chai.request(server)
            .get("/api/user/0")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(404);
                message.should.be.a("string").that.equals("User does not exist");
                done();
            });
    });
    it("TC-204-3 User ID exists", (done) => {
        chai.request(server)
            .get("/api/user/1")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))

            .end((req, res) => {
                let { status, result } = res.body;
                status.should.equals(200);
                result.should.be.an("object");
                result.should.have.property("id");
                result.should.have.property("firstName");
                result.should.have.property("lastName");
                result.should.have.property("isActive");
                result.should.have.property("emailAdress");
                result.should.have.property("password");
                result.should.have.property("phoneNumber");
                result.should.have.property("roles");
                result.should.have.property("street");
                result.should.have.property("city");
                done();
            });
    });
});

// UC-205 Modify user
describe("UC-205 Modify user - PUT /api/user/:id", () => {
    before((done) => {
        dbconnection.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(CLEAR_DB + INSERT_USER, (err, results, fields) => {
                if (err) throw err;
                connection.release();
                done();
            });
        });
    });
    it("TC-205-1 Required field missing", (done) => {
        chai.request(server)
            .put("/api/user/1")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send({
                firstName: "Marie",
                lastName: "Tilburg",
                isActive: true,
                // missing email should end up failing
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: "0612345678",
                roles: "editor,guest",
                street: "Hopstraat",
                city: "Amsterdam",
            })
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(400);
                message.should.be.a("string").that.equals("Email Address must be a string.");
                done();
            });
    });
    it("TC-205-2 Invalid postal code");
    it("TC-205-3 Invalid phone number", (done) => {
        chai.request(server)
            .put("/api/user/1")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send({
                firstName: "Klaas",
                lastName: "Tilburg",
                isActive: true,
                emailAdress: "k.tilburg@holland.nl",
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: 2, //TODO: edit when regex is done
                roles: "editor,guest",
                street: "Hopstraat",
                city: "Amsterdam",
            })
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(400);
                message.should.be.a("string").that.equals("phoneNumber must be a string.");
                done();
            });
    });
    it("TC-205-4 User doesn't exists", (done) => {
        chai.request(server)
            .put("/api/user/0")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send({
                firstName: "Klaas",
                lastName: "Tilburg",
                isActive: true,
                emailAdress: "k.tilburg@holland.nl",
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: "secret",
                roles: "editor,guest",
                street: "Hopstraat",
                city: "Amsterdam",
            })
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(400);
                message.should.be.a("string").that.equals("User does not exist");
                done();
            });
    });
    it("TC-204-5 Not logged in", (done) => {
        chai.request(server)
            .get("/api/user/1")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, "test"))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(401);
                message.should.be.a("string").that.equals("Invalid token");
                done();
            });
    });
    it("TC-205-6 User has been modified successfully", (done) => {
        chai.request(server)
            .put("/api/user/1")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send({
                firstName: "Klaas",
                lastName: "Tilburg",
                isActive: true,
                emailAdress: "k.tilburg@holland.nl",
                password: "dmG!F]!!6cUwK7JQ",
                phoneNumber: "secret",
                roles: "editor,guest",
                street: "Hopstraat",
                city: "Amsterdam",
            })
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(200);
                result.should.be.an("object");
                result.should.have.property("id");
                result.should.have.property("firstName");
                result.should.have.property("lastName");
                result.should.have.property("isActive");
                result.should.have.property("emailAdress");
                result.should.have.property("password");
                result.should.have.property("phoneNumber");
                result.should.have.property("roles");
                result.should.have.property("street");
                result.should.have.property("city");
                done();
            });
    });
});

// UC-206 Delete user
describe("UC-206 Delete user - DELETE /api/user/:id", () => {
    before((done) => {
        dbconnection.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(CLEAR_DB + INSERT_USER + INSERT_SECOND_USER, (err, results, fields) => {
                if (err) throw err;
                connection.release();
                done();
            });
        });
    });
    it("TC-206-1 User doesn't exist", (done) => {
        chai.request(server)
            .delete("/api/user/0")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(400);
                message.should.be.a("string").that.equals("User does not exist");
                done();
            });
    });
    it("TC-206-2 Not logged in", (done) => {
        chai.request(server)
            .delete("/api/user/1")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, "test"))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(401);
                message.should.be.a("string").that.equals("Invalid token");
                done();
            });
    });
    it("TC-206-3 Actor is not the owner", (done) => {
        chai.request(server)
            .delete("/api/user/2")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))

            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(403);
                message.should.be.a("string").that.equals("You can't delete this account because it isn't yours");
                done();
            });
    });
    it("TC-206-4 User has been deleted successfully", (done) => {
        chai.request(server)
            .delete("/api/user/1")
            .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
            .end((req, res) => {
                res.body.should.be.an("object");
                let { status, message } = res.body;
                status.should.equals(200);
                message.should.be.a("string").that.equals("User has been deleted successfully.");
                done();
            });
    });
});
