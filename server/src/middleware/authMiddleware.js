const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "JWT secret is not configured",
    });
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userID) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    req.userID = decoded.userID;
    req.user = {
      id: decoded.userID,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
