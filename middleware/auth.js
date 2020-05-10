const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = function (req, res, next) {
	// Get token from req header
	const token = req.header('x-auth-token')

	// Check if token exists
	if (!token) {
		return res.status(401).json({ msg: 'No token, authorization denied' })
	}

	// Verify token
	try {
		const decoded = jwt.verify(token, config.get('jwtSecret'))

		// token is valid
		req.user = decoded.user
		next()
	} catch (error) {
		// token is invalid
		res.status(401).json({ msg: 'Invalid token' })
	}
}
