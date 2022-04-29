const chai = require("chai");
const chaiHttp = require("chai-http");
var database = [];

const path = require("path");
const server = require(path.join(__dirname, "../../") + "/index");

chai.should();
chai.use(chaiHttp);

//UC-201 Register as new user
describe("UC-201 Register as new user - POST /api/user", () => {
    beforeEach((done) => {
        database = [];
        done();
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
                password: "geheim",
                phoneNumber: "06 38719633",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(400);
                result.should.be.a("string").that.equals("First Name must be a string.");
                done();
            });
    });
    it("TC-201-2 Non valid Email Address", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
                firstName: "Mike",
                lastName: "van der Caaij",
                street: "Gareelweg 11",
                city: "Heerle",
                isActive: true,
                emailAddress: "testingemail",
                password: "geheim",
                phoneNumber: "06 38719633",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(400);
                result.should.be.a("string").that.equals("Email is not valid.");
                done();
            });
    });
    it("TC-201-3 Non valid Password", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
                firstName: "Mike",
                lastName: "van der Caaij",
                street: "Gareelweg 11",
                city: "Heerle",
                isActive: true,
                emailAddress: "m.vandercaaij@student.avans.nl",
                // no known password validation
                phoneNumber: "06 38719633",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(400);
                result.should.be.a("string").that.equals("Password must be a string.");
                done();
            });
    });
    it("TC-201-4 User already exists", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
                firstName: "Mike",
                lastName: "van der Caaij",
                street: "Gareelweg 11",
                city: "Heerle",
                isActive: true,
                emailAddress: "m.vandercaaij@student.avans.nl", //this email is already in use === user exists
                password: "geheim",
                phoneNumber: "06 38719633",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status } = res.body;
                status.should.equals(409);
                done();
            });
    });
    it("TC-201-5 User has succesfully been registered", (done) => {
        chai.request(server)
            .post("/api/user")
            .send({
                firstName: "Ivelisse",
                lastName: "Hahn",
                street: "Gala Station",
                city: "North Cyrus",
                isActive: true,
                emailAddress: "ivelisse.hahn@email.com",
                password: "vIty6Q9B4s",
                phoneNumber: "+1-649 595.220.6195 x131",
            })
            .end((req, res) => {
                res.should.be.an("object");
                let { status } = res.body;
                status.should.equals(201);
                done();
            });
    });
});
