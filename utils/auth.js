const jwt = require("jsonwebtoken");
// 统一鉴权 中间件
module.exports = function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).send({ error: "Token Lost" });
  }

  jwt.verify(token, "secret", function (err, decoded) {
    if (err) {
      return res.status(403).send({ error: err });
    }

    req.user = decoded;
    next();
  });
};
