const jwt = require("jsonwebtoken");
exports.auth = async (req, res, next) => {
  try {
    const token = req.headers.Authorization || req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        status: 401,
        message: "Auth token not provided",
      });
    }
    const auth = token.split(" ")[1];
    jwt.verify(auth, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
          status: 401,
          message: "Auth Failed",
        });
      }
      req.user = decoded;
    });

    next();
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "internal server error",
      err: err,
    });
  }
};
