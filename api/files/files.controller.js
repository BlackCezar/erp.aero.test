const { Router } = require("express");
const authCheck = require("../../middleware/authCheck");
const filesService = require("./files.service");
const filesRouter = Router();

filesRouter.use(authCheck);
filesRouter.post("/upload", filesService.upload);
filesRouter.get("/list", filesService.list);
filesRouter.delete("/delete/:id", filesService.delete);
filesRouter.get("/:id", filesService.getFile);
filesRouter.get("/download/:id", filesService.download);
filesRouter.put("/update/:id", filesService.update);

module.exports = filesRouter;
