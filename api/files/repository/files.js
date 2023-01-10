const dbService = require("../../../services/db.service");

class FilesRepository {
  constructor() {
    dbService.connection.query(
      "CREATE TABLE if not exists `public`.`files` (`id` INT NOT NULL AUTO_INCREMENT,`name` VARCHAR(255) NOT NULL,`path` VARCHAR(255) NOT NULL,`extension` VARCHAR(10) NOT NULL,`type` VARCHAR(255) NOT NULL,`size` INT NOT NULL,`date` DATETIME NOT NULL DEFAULT NOW(),PRIMARY KEY (`id`));"
    );
  }

  create(file) {
    return new Promise((resolve, reject) => {
      const tmpName = file.originalname.split(".");
      const extension = tmpName.pop();
      const name = tmpName.join("");
      const insert = {
        name,
        extension,
        type: file.mimetype,
        size: file.size,
        path: file.filename,
      };
      dbService.connection.query(
        "INSERT INTO `files` SET ?",
        insert,
        (err, result) => {
          if (err) reject(err);
          resolve({
            id: result.insertId,
            ...insert,
          });
        }
      );
    });
  }

  update(file, id) {
    return new Promise((resolve, reject) => {
      const tmpName = file.originalname.split(".");
      const extension = tmpName.pop();
      const name = tmpName.join("");
      const insert = [
        name,
        extension,
        file.mimetype,
        file.size,
        file.filename,
        id,
      ];

      dbService.connection.query(
        "UPDATE `files` SET `name`= ?,`extension`=?,`type`=?,`size`=?,`path`=? WHERE `id`= ?",
        insert,
        (err, _result) => {
          if (err) reject(err);
          resolve({
            id: id,
            name,
            extension,
            type: file.mimetype,
            size: file.size,
            path: file.filename,
          });
        }
      );
    });
  }

  list({ limit, page }) {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      dbService.connection.query(
        "SELECT SQL_CALC_FOUND_ROWS * FROM `files` ORDER BY `id` LIMIT ?, ?",
        [offset, limit],
        (err, result) => {
          if (err) reject(err);
          dbService.connection.query(
            "SELECT FOUND_ROWS()",
            (foundErr, foundResult) => {
              if (foundErr) reject(foundErr);
              const count = foundResult[0]["FOUND_ROWS()"];
              resolve({
                total: count,
                list: result,
              });
            }
          );
        }
      );
    });
  }
  get(id) {
    return new Promise((resolve, reject) => {
      dbService.connection.query(
        "SELECT * FROM `files` WHERE id = ?",
        id,
        (err, result) => {
          if (err) reject(err);
          resolve(result.length ? result[0] : undefined);
        }
      );
    });
  }
  delete(id) {
    return new Promise((resolve, reject) => {
      dbService.connection.query(
        "SELECT * FROM `files` where id= ?",
        id,
        (err, file) => {
          if (err) reject(err);

          dbService.connection.query(
            "DELETE FROM `files` where id= ?",
            id,
            (deleteErr) => {
              if (deleteErr) reject(deleteErr);
              resolve(file.length ? file[0] : undefined);
            }
          );
        }
      );
    });
  }
}

module.exports = new FilesRepository();
