//instantiate installed modules
const express = require("express");
const app = express();
const userRouter = require(__dirname + "/src/routes/user.routes");

//set port to either predefined server port or 3000 that can be used for local testing
const port = process.env.PORT || 3000;

//enable app to parse json
app.use(express.json());

//load al user routes
app.use(userRouter);

//when there is an invalid request
app.all("*", (req, res) => {
    res.status(404).json({
        status: 404,
        result: "Endpoint not found.",
    });

    //end response process
    res.end();
});

//error handler
app.use((err, req, res, next) => {
    res.status(err.status).json(err);
});

//make server listen to given ports
app.listen(port, () => {
    console.log("Server running at " + port);
});
