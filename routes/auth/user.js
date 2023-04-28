const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const gravatar = require("gravatar");
const fsp = require('fs/promises')
const Jimp = require("jimp");
const {
  createHash,
  createHttpException,
  createJWT,
} = require("../../servceis/index");
const { UserModel } = require("../../database/user.model");
const router = express.Router();
const crypto = require("crypto");
const {
  userAuthMiddeleware,
} = require("../../middlewares/user-auth.middleware");
const { upload } = require("../../middlewares/upload");



const publicPath = path.join(__dirname, "../../", "public", "avatars");

router.patch("/avatars", userAuthMiddeleware, upload.single("avatar"), async (req, res) => {
  const { path: tempUpload, originalname } = req.file;
  const user = req.user;
  const fileName = `${user._id}_${originalname}`;

  try {
    const resultUpload = path.join(publicPath, fileName);

    Jimp.read(tempUpload, (err, avatar) => {
      if (err) throw err;
      avatar
        .resize(250, 250)
        .write(tempUpload); 
    });

    await fsp.rename(tempUpload, resultUpload);
    
    const avatarURL = path.join( "avatars", fileName);
    await UserModel.findByIdAndUpdate(user._id, { avatarURL });
  
    res.status(201).json({avatarURL});
  } catch (error) {
    await fsp.unlink(tempUpload);
    throw error;
    
  }
});

router.post("/sign-up", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const passwordHash = await createHash(password);
    const avatarURL = gravatar.url(email);
    console.log(avatarURL);

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw createHttpException("Email in use", 409);
    }

    const newUser = await UserModel.create({ email, passwordHash, avatarURL });

    const sessionKey = crypto.randomUUID();
    await UserModel.findByIdAndUpdate(newUser._id, { sessionKey });

    const accessJWT = createJWT({
      userId: String(newUser._id),
      sessionKey,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: avatarURL,
      },
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
    const user = req.user;
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
