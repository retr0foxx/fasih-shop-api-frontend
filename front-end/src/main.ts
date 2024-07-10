import express from "express";
import * as Express from "express";


const express_app: Express.Application = express();
const static_router: Express.RequestHandler = Express.static("public");

const PORT = 7273;

express_app.use("/", static_router);

express_app.listen(PORT, "localhost", () => {
    console.log(`Running on localhost:${PORT}`);
});

