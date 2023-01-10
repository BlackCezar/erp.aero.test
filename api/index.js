const bodyParser = require("body-parser");
const { Router } = require("express");
const AuthRouter = require("./auth/auth.controller");
const FileRouter = require("./files/files.controller");

const APIRouter = Router();

APIRouter.use(bodyParser.json());
APIRouter.use(AuthRouter);
APIRouter.use("/file", FileRouter);

module.exports = APIRouter;
