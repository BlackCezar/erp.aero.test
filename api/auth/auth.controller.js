const { Router } = require("express");
const authCheck = require("../../middleware/authCheck");
const authService = require("./auth.service");

const authRouter = Router();

authRouter.post("/signin", authService.signIn);
authRouter.post("/signin/new_token", authService.refreshToken);
authRouter.post("/signup", authService.signUp);

authRouter.use(authCheck);
authRouter.get("/info", authService.getInfo);
authRouter.get("/latency", authService.getLatency);
authRouter.get("/logout", authService.logOut);

module.exports = authRouter;
