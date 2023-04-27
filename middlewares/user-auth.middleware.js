const { createHttpException, verifyJWT } = require("../servceis/index");
// const jwt = require("jsonwebtoken");
const { UserModel } = require("../database/user.model");

const userAuthMiddeleware = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    console.log(authorizationHeader)
    if (!authorizationHeader) {
      throw createHttpException("Not authorized 01", 401);
    }

    const [bearer, token] = authorizationHeader.split(" ");
    if (bearer !== "Bearer" || !token) {
      throw createHttpException("Not authorized 02", 401);
    }
    try {
      const tokenPayload = verifyJWT(token);
      if (!tokenPayload.userId || !tokenPayload.sessionKey) {
        throw createHttpException("Not authorized 03", 401);
      }

      const user = await UserModel.findById(tokenPayload.userId);
      if (!user) {
        throw createHttpException("Not authorized 04", 401);
      }

      if (tokenPayload.sessionKey !== user.sessionKey) {
        throw createHttpException("Not authorized 05", 401);
      }
      req.user = user;
      next();
    } catch (error) {
      throw createHttpException("Not authorized 06", 401);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  userAuthMiddeleware,
};




