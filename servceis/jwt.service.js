const jwt = require('jsonwebtoken')

const { JWT_SECRET, JWT_EXPIRES_IN_SECONDS } = process.env

const createJWT = (playload) => {
    const token = jwt.sign(
        playload,
        JWT_SECRET,
        { expiresIn: `${JWT_EXPIRES_IN_SECONDS}s`},
    )
    return token
};

const verifyJWT = (token) => {
    return jwt.verify(token, JWT_SECRET)
};

module.exports = {
    createJWT,
    verifyJWT,
}