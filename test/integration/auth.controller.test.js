process.env.DB_DATABASE = process.env.DB_DATABASE || "share-a-meal-testdb";

const chai = require("chai");
const chaiHttp = require("chai-http");
const crypto = require("crypto");
const server = require("./../../index");
const dbconnection = require("./../../database/dbconnection");
const assert = require("assert");

const { encryptPassword } = require("./../../src/controllers/user.controller");

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const hashedPassword = encryptPassword("V3ryS3cr3t");

const INSERT_USER = `INSERT INTO user (id, firstName, lastName, emailAdress, password, street, city ) VALUES (1, "first", "last", "test@server.nl", "${hashedPassword}", "street", "city");`;

// UC-100 Authentication tests
describe("UC-100 Authentication tests - POST /api/user", () => {
    beforeEach((done) => {
        dbconnection.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(CLEAR_DB + INSERT_USER, (err, results, fields) => {
                if (err) throw err;
                connection.release();
                done();
            });
        });
    });

    // UC-101 Login
    describe("UC-101 Login - POST /api/user", () => {
        it("TC-101-1 Required input is missing", (done) => {
            chai.request(server)
                .post("/api/auth/login")
                .send({
                    // emailAdress missing
                    password: "V3ryS3cr3t",
                })
                .end((req, res) => {
                    res.should.be.an("object");
                    const { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a("string").that.equals("Email must be a string");
                    done();
                });
        });
        it("TC-101-2 Invalid Email Address", (done) => {
            chai.request(server)
                .post("/api/auth/login")
                .send({
                    emailAdress: "invalidEmail",
                    password: "V3ryS3cr3t",
                })
                .end((req, res) => {
                    res.should.be.an("object");
                    const { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a("string").that.equals("Email is not valid.");
                    done();
                });
        });
        it("TC-101-3 Invalid Password", (done) => {
            chai.request(server)
                .post("/api/auth/login")
                .send({
                    emailAdress: "m.vandullemen@server.nl",
                    password: "secret",
                })
                .end((req, res) => {
                    res.should.be.an("object");
                    const { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a("string").that.equals("Password must contain 1 capital, 1 special letter and at least 8 characters.");
                    done();
                });
        });
        it("TC-101-4 User doesn't exist", (done) => {
            chai.request(server)
                .post("/api/auth/login")
                .send({
                    emailAdress: `${crypto.randomBytes(25).toString("hex")}@gmail.com`,
                    password: "V3ryS3cr3t",
                })
                .end((req, res) => {
                    res.should.be.an("object");
                    const { status, message } = res.body;
                    status.should.equals(404);
                    message.should.be.a("string").that.equals("User not found or password invalid");

                    done();
                });
        });

        it("TC-101-5 User succesfully logged in", (done) => {
            chai.request(server)
                .post("/api/auth/login")
                .send({
                    emailAdress: "test@server.nl",
                    password: "V3ryS3cr3t",
                })
                .end((req, res) => {
                    res.should.be.an("object");
                    const { status, result } = res.body;
                    status.should.equals(200);
                    result.should.be.an("object");
                    assert.deepEqual(result, {
                        id: 1,
                        firstName: "first",
                        lastName: "last",
                        isActive: true,
                        emailAdress: "test@server.nl",
                        phoneNumber: "-",
                        roles: "editor,guest",
                        street: "street",
                        city: "city",
                        token: res.body.result.token,
                    });
                    done();
                });
        });
    });
});
