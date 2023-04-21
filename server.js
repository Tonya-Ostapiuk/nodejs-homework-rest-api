require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");

const { MONGO_CONNECTION_STRING, PORT = 3000 } = process.env;

mongoose
  .connect(MONGO_CONNECTION_STRING)
  .then(() => {console.log("Database connection successful")
  app.listen(PORT, () => 
    console.log(`Server running. Use our API on port: ${PORT} `))})
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });