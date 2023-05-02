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
  sendEmailVerificationLatter,
} = require("../../servceis/index");
const { UserModel } = require("../../database/user.model");
const { emailSchema } = require("../../schemas/email.schema");
const router = express.Router();
const crypto = require("crypto");
const {
  userAuthMiddeleware,
} = require("../../middlewares/user-auth.middleware");
const { upload } = require("../../middlewares/upload");


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
    const verificationToken = crypto.randomUUID()
    const newUser = await UserModel.create({ email, passwordHash, avatarURL, verificationToken })
  
    const sessionKey = crypto.randomUUID();
  
    await UserModel.findByIdAndUpdate(newUser._id, { sessionKey });

    const accessJWT = createJWT({
      userId: String(newUser._id),
      sessionKey,
    });

    const mail = {
      to: email,
      subject: "Get your verification link ;)",
      html: `<a href="http://localhost:3000/auth/verify/${verificationToken}">Click to verify your email</a>`,
    }

    await sendEmailVerificationLatter(mail)

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: avatarURL,
        verificationToken,
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

    if (!user || !user.verify) {
      throw createHttpException("User or verify not found", 404);
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
    await UserModel.findByIdAndUpdate(user._id, { sessionKey: null });
    if (!user) {
      throw createHttpException("Not authorized 1.1", 401);
    }

    res.status(204).json("Not authorized 1.2");
  } catch (error) {
    next(error);
  }
});

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

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const userVerification = await UserModel.findOne({verificationToken});
    console.log(userVerification)
    if (!userVerification) {
      throw createHttpException("User not not found", 404);
    }

    await UserModel.findByIdAndUpdate(userVerification._id, {
      verify: true,
      verificationToken: null,
  });

    res.status(201).json("Verification successful");
  } catch (error) {
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const {email} = req.body;
    const { error } = emailSchema.validate({ email});

    if (error) {
      throw createHttpException("Missing field", 400);
    }

    const user = await UserModel.findOne({email});
    if (!user) {
      throw createHttpException("Missing required field email", 400);
    }

    if (user.verify) {
      throw createHttpException("Verification has already been passed", 400);
    }

    const verifyEmail = {
      to: email,
      subject: "Get your verification link ;)",
      html: `<a href="http://localhost:3000/auth/verify/${user.verificationToken}">Click to verify your email</a>`,
    }

    await sendEmailVerificationLatter(verifyEmail)

    res.status(201).json("Veify email send sucess");
  } catch (error) {
    next(error);
  }
});


module.exports = router;
