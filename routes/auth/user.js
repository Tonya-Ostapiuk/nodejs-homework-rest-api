const express = require("express");
const bcrypt = require("bcrypt");
const {createHash, createHttpException, createJWT} = require("../../servceis/index");
const { UserModel } = require("../../database/user.model");
const router = express.Router();
const crypto = require("crypto");
const { userAuthMiddeleware } = require("../../middlewares/user-auth.middleware");


router.post("/sign-up", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const passwordHash = await createHash( password );

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw createHttpException("Email in use", 409);  
    }

    const newUser = await UserModel.create({ email, passwordHash });

    const sessionKey = crypto.randomUUID();
    await UserModel.findByIdAndUpdate(newUser._id, { sessionKey });

    const accessJWT = createJWT({
      userId: String(newUser._id),
      sessionKey,
    });

    res.status(201).json({
      user: { email: newUser.email, subscription: newUser.subscription },
  });
  } catch (error) {
    next(error);
  }
});

router.post("/sign-in", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      throw createHttpException("User not found", 404);
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ message: "Email or password is wrong" });
      return;
    }
    const sessionKey = crypto.randomUUID();
    await UserModel.findByIdAndUpdate(user._id, { sessionKey });

    const accessJWT = createJWT({
      userId: String(user._id),
      sessionKey,
    });

    res.status(201).json({
      token: accessJWT,
      user: { email: user.email, subscription: user.subscription },
  });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", userAuthMiddeleware, async (req, res, next) => {
  try {
    const user = req.user
    // console.log(req.user);
    await UserModel.findByIdAndUpdate(user._id, { sessionKey: null });
    if (!user) {
      throw createHttpException("Not authorized 1.1", 401);
    }

    res.status(204).json("Not authorized 1.2");

  } catch (error) {
    next(error);
  }
});


module.exports = router;
