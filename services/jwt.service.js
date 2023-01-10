const { randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");

class JWTService {
  constructor({ secret, refreshTokenExp, accessTokenExp }) {
    this.jwt = jwt;
    this.secret = secret;
    this.accessTokenExp = accessTokenExp;
    this.refreshTokenExp = refreshTokenExp;
    this.generateUUID = randomUUID;
  }

  generateAccessToken(userId) {
    const payload = {
      userId,
      type: "access",
    };
    console.log(this.secret);
    return this.jwt.sign(payload, this.secret, {
      expiresIn: this.accessTokenExp,
    });
  }

  generateRefreshToken() {
    const payload = {
      id: this.generateUUID(),
      type: "refresh",
    };
    return {
      token: this.jwt.sign(payload, this.secret, {
        expiresIn: this.refreshTokenExp,
      }),
      id: payload.id,
    };
  }

  verifyToken(token) {
    try {
      const decoded = this.jwt.verify(token, this.secret);
      return {
        data: decoded,
        isValid: true,
      };
    } catch (err) {
      console.error(err);
      return {
        message: err.message,
        isValid: false,
      };
    }
  }
}

const config = {
  secret: process.env.JWT_SECRET ?? "secret",
  accessTokenExp: parseInt(process.env.JWT_ACCESS_EXP ?? 60 * 10),
  refreshTokenExp: parseInt(process.env.JWT_REFRESH_EXP ?? 60 * 15),
};
const jwtService = new JWTService(config);
module.exports = jwtService;
