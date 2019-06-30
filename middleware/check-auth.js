const jtw = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        console.log(token.substring(7))
        const decoded = jtw.verify(token, process.env.SECRET);
        next();
    } catch (e) {
        return res.status(401).json({
            message: "Auth failed"
        });
    }

}