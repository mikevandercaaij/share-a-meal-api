const assert = require("assert");
const jwt = require("jsonwebtoken");
const dbconnection = require("../../database/dbconnection");
// const validateEmail = require('../util/emailvalidator')
const jwtSecretKey = require("../config/config").jwtSecretKey;
