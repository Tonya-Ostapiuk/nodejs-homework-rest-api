const mongoose = require("mongoose");

const userShema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      trim: true,
    },
    sessionKey: {
      type: String,
      default: null,
      trim: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter"
    },
    token: String,
    avatarURL: String,
    
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, 'Verify token is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
  
);

const UserModel = mongoose.model("user", userShema);

module.exports = {
  UserModel,
};
