const multer = require("multer");
const path = require("path");

const tempPath = path.join(__dirname, "../", "tmp");

const multerStorage = multer.diskStorage({
  destination: 
   tempPath,
   filename: (req, file, cb) => {
    cb(null, file.originalname);
},
})

const upload = multer({ storage: multerStorage })

module.exports = {
    upload,
}