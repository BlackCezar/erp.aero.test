const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();

class DBService {
  constructor(connectionUri) {
    this.connection = mysql.createConnection(connectionUri);
  }
}

const dbService = new DBService(process.env.DB_URL);
module.exports = dbService;
