const bcrypt = require("bcrypt");

 const createHash = async (input) => {
    return await bcrypt.hash(input, 10);
}

module.exports = {
  createHash,
};
