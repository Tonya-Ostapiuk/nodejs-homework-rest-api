const sgMail = require("@sendgrid/mail");
require("dotenv").config();
const { createHttpException } = require("./create-http-exception.service");

const { SANGRID_API_KEY, SANGRID_SENDER_ADDRESS } = process.env;

sgMail.setApiKey(SANGRID_API_KEY);

const sendEmailVerificationLatter = async (data) => {
  const email = {
    ...data,
    to: "vemanef847@saeoil.com",
    from: SANGRID_SENDER_ADDRESS,
  };
  try {
    await sgMail.send(email);
    return true;
  } catch (error) {
    throw createHttpException(
      "Sorry. Sending email verification letter failed",
      504
    );
  }
};


module.exports = {
  sendEmailVerificationLatter,
};
