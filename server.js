const express = require("express");
const dotenv = require("dotenv");
const APIRouter = require("./api");
const cors = require("cors");
dotenv.config();

const server = express();
const port = process.env.PORT ?? 5000;
server.use(APIRouter);
server.use(cors());
server.options("*", cors());
runServer();

async function runServer() {
  try {
    server.listen(port, () => console.log(`Server started  on port ${port}`));
  } catch (err) {
    console.error("Server Error", err);
  }
}
