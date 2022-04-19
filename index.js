const http = require("http");

const port = 3000;

const result = {
    code: 200,
    message: "Hello World",
};

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end(JSON.stringify(result));
});

server.listen(port, () => {
    console.log("Server running at " + port);
});
