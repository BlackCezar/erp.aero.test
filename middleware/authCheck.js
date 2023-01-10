const jwtService = require("../services/jwt.service");

module.exports = function (req, res, next) {
  const authorization = req.get("Authorization");
  if (!authorization)
    return res.status(401).json({ message: "Token not provided" });

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwtService.verifyToken(token);
    req.user = payload.data;
    if (payload.isValid && payload.data.type === "access") next();
    else throw new Error(payload.message ?? "Invalid token");
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
