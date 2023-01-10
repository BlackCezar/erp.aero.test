const bcrypt = require("bcrypt");

async function encryptPassword(password) {
  return bcrypt.hash(password, 10);
}
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  encryptPassword,
  comparePassword,
};
