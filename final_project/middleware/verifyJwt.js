const jwt = require("jsonwebtoken");
const path = require("path");

const verifyJwt = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) return res.sendStatus(403);

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SEC, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.users = decoded.username;
    next();
  });
};

module.exports = verifyJwt;
