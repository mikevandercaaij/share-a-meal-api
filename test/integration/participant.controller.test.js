// process.env.DB_DATABASE = process.env.DB_DATABASE || "share-a-meal-testdb";

// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const crypto = require("crypto");
// const server = require("./../../index");
// const dbconnection = require("./../../database/dbconnection");

// chai.should();
// chai.use(chaiHttp);

// let succesfullAddId;
// const INSERT_USER = "INSERT INTO `user` (`firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" + '("first", "last", "name@server.nl", "secret", "street", "city");';
// const DELETE_USER = "DELETE FROM user WHERE id = ?";

// // UC-101 Login
// describe("UC-101 Login - POST /api/user", () => {
//     it("TC-101-1 Required input is missing", (done) => {
//         chai.request(server)
//             .post("/api/auth/login")
//             .send({
//                 // emailAdress missing
//                 password: "secret",
//             })
//             .end((req, res) => {
//                 res.should.be.an("object");
//                 const { status, message } = res.body;
//                 status.should.equals(400);
//                 message.should.be.a("string").that.equals("Email must be a string");
//                 done();
//             });
//     });
//     it("TC-101-2 Invalid Email Address", (done) => {
//         chai.request(server)
//             .post("/api/auth/login")
//             .send({
//                 // TODO: rewrite when regex is added
//                 password: "secret",
//             })
//             .end((req, res) => {
//                 res.should.be.an("object");
//                 const { status, message } = res.body;
//                 status.should.equals(400);
//                 message.should.be.a("string").that.equals("Email must be a string");
//                 done();
//             });
//     });
//     it("TC-101-3 Invalid Password", (done) => {
//         chai.request(server)
//             .post("/api/auth/login")
//             .send({
//                 emailAdress: "m.vandullemen@server.nl",
//                 // TODO: rewrite when regex is added
//             })
//             .end((req, res) => {
//                 res.should.be.an("object");
//                 const { status, message } = res.body;
//                 status.should.equals(400);
//                 message.should.be.a("string").that.equals("Password must be a string");
//                 done();
//             });
//     });
//     it("TC-101-4 User doesn't exist", (done) => {
//         chai.request(server)
//             .post("/api/auth/login")
//             .send({
//                 emailAdress: `${crypto.randomBytes(25).toString("hex")}@gmail.com`,
//                 password: "secret",
//             })
//             .end((req, res) => {
//                 res.should.be.an("object");
//                 const { status, message } = res.body;
//                 status.should.equals(404);
//                 message.should.be.a("string").that.equals("User not found or password invalid");

//                 done();
//             });
//     });
//     before((done) => {
//         dbconnection.getConnection((err, connection) => {
//             if (err) throw err;

//             connection.query(INSERT_USER, (err, results, fields) => {
//                 if (err) throw err;
//                 connection.release();
//                 succesfullAddId = results.insertId;
//                 done();
//             });
//         });
//     });
//     it("TC-101-5 User succesfully logged in", (done) => {
//         chai.request(server)
//             .post("/api/auth/login")
//             .send({
//                 emailAdress: "name@server.nl",
//                 password: "secret",
//             })
//             .end((req, res) => {
//                 res.should.be.an("object");
//                 const { status, result } = res.body;
//                 status.should.equals(200);
//                 result.should.be.an("object");
//                 result.should.have.property("id");
//                 result.should.have.property("emailAdress");
//                 result.should.have.property("firstName");
//                 result.should.have.property("lastName");
//                 result.should.have.property("token");

//                 done();
//             });
//     });
//     after((done) => {
//         dbconnection.getConnection((err, connection) => {
//             if (err) throw err;

//             connection.query(DELETE_USER, succesfullAddId, (err, results, fields) => {
//                 if (err) throw err;
//                 connection.release();
//                 done();
//             });
//         });
//     });
// });
