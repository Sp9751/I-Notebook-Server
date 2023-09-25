const jwt = require('jsonwebtoken')

const secret = process.env.JWT_SECRET;

const fetchuser = (req, res, next) => {
    // get the user from the jwt token and id to req
    const token = req.header('auth-token')
    if (!token) {
        res.status(401).send({ error: 'please authenticate using a valid token' })
    }
    try {
        const String = jwt.verify(token, secret)
        req.user = String.user;
        next()
    } catch (error) {
        res.status(401).send({ error: 'please authenticate using a valid token' })
    }

}

module.exports = fetchuser;