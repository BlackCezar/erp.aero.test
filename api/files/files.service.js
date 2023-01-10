const multer = require("multer");
const fs = require("fs/promises");
const { existsSync } = require("fs");
const { join } = require("path");
const FileRepository = require("./repository/files");

class FilesService {
  constructor() {
    const dest = join(process.cwd(), process.env.FILES_DEST);
    if (!existsSync(dest)) {
      fs.mkdir(dest);
    }
    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, dest);
      },
    });

    this.uploader = multer({ storage }).single("file");

    this.upload = this.upload.bind(this);
    this.update = this.update.bind(this);
  }

  upload(req, res) {
    this.uploader(req, res, async (err) => {
      try {
        if (err instanceof multer.MulterError)
          throw new Error("Error on upload file");
        if (err) throw err;
        if (!req.file) throw new Error("File not provided");
        const file = await FileRepository.create(req.file);
        res.json(file);
      } catch (err) {
        res.status(400).json(err.message);
      }
    });
  }

  async list(req, res) {
    const listSize = Number(req.query.list_size ?? 10);
    const page = Number(req.query.page ?? 1);
    const files = await FileRepository.list({ limit: listSize, page });
    res.json(files);
  }

  async delete(req, res) {
    const id = req.params.id;
    if (!id) res.status(400).json({ message: "Id not provided" });
    const file = await FileRepository.delete(id);
    if (!file) return res.status(400).json({ message: "File not found" });
    const dest = join(process.cwd(), process.env.FILES_DEST, file.path);
    await fs.unlink(dest);
    return res.json({ message: "File removed" });
  }

  async getFile(req, res) {
    const id = req.params.id;
    if (!id) res.status(400).json({ message: "Id not provided" });
    const file = await FileRepository.get(id);
    if (!file) return res.status(400).json({ message: "File not found" });
    res.json(file);
  }

  async download(req, res) {
    const id = req.params.id;
    if (!id) res.status(400).json({ message: "Id not provided" });
    const file = await FileRepository.get(id);
    if (!file) return res.status(400).json({ message: "File not found" });
    const dest = join(process.cwd(), process.env.FILES_DEST, file.path);
    const fileName = `${file.name}.${file.extension}`;
    res.download(dest, fileName, {
      headers: {
        "Content-Type": file.type + "; charset=utf8",
        "Content-Length": file.size,
      },
    });
  }

  update(req, res) {
    const id = req.params.id;
    if (!id) res.status(400).json({ message: "Id not provided" });

    this.uploader(req, res, async (err) => {
      try {
        if (err instanceof multer.MulterError)
          throw new Error("Error on upload file");
        if (err) throw err;
        if (!req.file) throw new Error("File not provided");
        const file = await FileRepository.get(id);
        if (!file) throw new Error("Previous file not found");
        const dest = join(process.cwd(), process.env.FILES_DEST, file.path);
        await fs.unlink(dest);

        const updatedFile = await FileRepository.update(req.file, file.id);
        res.json(updatedFile);
      } catch (err) {
        await fs.unlink(req.file.path);
        res.status(400).json({ message: err.message });
      }
    });
  }
}

module.exports = new FilesService();
