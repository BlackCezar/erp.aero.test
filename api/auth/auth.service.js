const UsersRepository = require("./repository/users");
const { comparePassword, encryptPassword } = require("./auth.helpers");
const jwtService = require("../../services/jwt.service");
const TokenRepository = require("./repository/tokens");

class AuthService {
  constructor() {
    this.updateTokens = this.updateTokens.bind(this);
    this.signUp = this.signUp.bind(this);
    this.signIn = this.signIn.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  async signIn(req, res) {
    const { id, password } = req.body;
    if (!id || !password)
      return res.status(400).json({ message: "Invalid data" });

    const user = await UsersRepository.findById(id);
    if (!user) res.status(400).json({ message: "User does not exist" });
    const isValid = await comparePassword(password, user.password);
    if (isValid) {
      const tokens = await this.updateTokens(user.id);
      res.json(tokens);
    } else res.status(401).json({ message: "Invalid credentials" });
  }

  async updateTokens(userId) {
    const accessToken = jwtService.generateAccessToken(userId);
    const refreshToken = jwtService.generateRefreshToken();

    await TokenRepository.replaceRefreshToken(refreshToken.id, userId);
    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async signUp(req, res) {
    try {
      const { id, password } = req.body;
      if (!id || !password)
        return res.status(400).json({ message: "Invalid data" });
      const encryptedPassword = await encryptPassword(password);
      const user = await UsersRepository.create({
        id,
        password: encryptedPassword,
      });
      const tokens = await this.updateTokens(user.id);
      res.json(tokens);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY")
        return res.status(400).json({ message: "Duplicate id" });
      console.log("SingUp error", err);
      res.status(400).json(err.message);
    }
  }

  async getInfo(req, res) {
    if (!req.user || !req.user.userId)
      return res.status(401).json({ message: "Invalid data" });
    const user = await UsersRepository.findById(req.user.userId);

    if (!user) return res.status(400).json({ message: "Not found user" });
    res.json({
      id: user.id,
    });
  }
  getLatency(req, res) {
    res.json("TODO latency");
  }
  async refreshToken(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Not provided refreshToken" });
    try {
      const payload = jwtService.verifyToken(refreshToken);
      if (payload.isValid) {
        if (payload.data.type !== "refresh")
          return res.status(400).json({ message: "Invalid token" });
        const token = await TokenRepository.findById(payload.data.id);
        if (!token) throw new Error("Invalid token");
        console.log("Token", token);
        const tokens = await this.updateTokens(token.userId);
        res.json(tokens);
      } else throw payload;
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
  async logOut(req, res) {
    await TokenRepository.deleteToken(req.user.userId);
    res.sendStatus(200);
  }
}
module.exports = new AuthService();
