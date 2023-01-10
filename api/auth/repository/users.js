const dbService = require("../../../services/db.service");

class UserRepository {
  constructor() {
    dbService.connection.query(
      "CREATE TABLE if not exists `users` (id VARCHAR(30) NOT NULL PRIMARY KEY, password VARCHAR(255) NOT NULL)",
      (err, res) => {
        console.log(err, res);
      }
    );
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM `users` WHERE id= ?";
      dbService.connection.query(query, id, (err, result) => {
        if (err) reject(err);
        resolve(result.length ? result[0] : undefined);
      });
    });
  }
  create(data) {
    return new Promise((resolve, reject) => {
      const query = "INSERT INTO `users` SET ?";
      dbService.connection.query(query, data, (err, result) => {
        if (err) reject(err);
        resolve({
          id: data.id,
          password: data.password,
        });
      });
    });
  }
}

module.exports = new UserRepository();
