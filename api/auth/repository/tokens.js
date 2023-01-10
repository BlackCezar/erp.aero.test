const dbService = require("../../../services/db.service");

class TokenRepository {
  constructor() {
    dbService.connection.query(
      "CREATE TABLE if not exists `tokens` (id VARCHAR(255) NOT NULL PRIMARY KEY, userId VARCHAR(30) NOT NULL)",
      (err, res) => {
        console.log(err, res);
      }
    );
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      dbService.connection.query(
        "SELECT * FROM `tokens` WHERE id= ?",
        id,
        (error, result) => {
          if (error) reject(error);
          resolve(result.length ? result[0] : undefined);
        }
      );
    });
  }
  async replaceRefreshToken(tokenId, userId) {
    await this.deleteToken(userId);
    console.log("Replace tokens", tokenId, userId);
    return await this.createToken({ id: tokenId, userId });
  }
  deleteToken(id) {
    return new Promise((resolve, reject) => {
      dbService.connection.query(
        "DELETE FROM `tokens` WHERE userId= ?",
        [id],
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
    });
  }
  createToken(payload) {
    return new Promise((resolve, reject) => {
      dbService.connection.query(
        "INSERT INTO tokens SET ?",
        payload,
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
    });
  }
}

module.exports = new TokenRepository();
