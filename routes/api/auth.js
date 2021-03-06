const express = require('express')
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')

const User = require('../../models/User')

const router = express.Router()

// @route GET api/auth
// @desc Authentication route
// @access Public
router.get('/', auth, async (req, res) => {
	try {
		// Find user in DB for the token
		const user = await User.findById(req.user.id).select('-password')
		res.json(user)
	} catch (error) {
		res.status(500).send('Server error')
	}
})

/*
 * @route POST api/auth
 * @desc Authenticate user & get token
 * @access Public
 */

router.post(
	'/',
	[
		check('email', 'Please enter a valid email').isEmail(),
		check('password', 'Password is required').exists()
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { email, password } = req.body
		try {
			// See if user exists
			let user = await User.findOne({ email })
			if (!user) {
				return res.status(400).json({
					errors: [{ msg: 'Invalid credentials' }]
				})
			}

			// Check if credentials are correct
			const isMatch = await bcrypt.compare(password, user.password)
			if (!isMatch) {
				return res.status(400).json({
					errors: [{ msg: 'Invalid credentials' }]
				})
			}

			// Return jsonwebtoken
			const payload = {
				user: {
					id: user.id
				}
			}
			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 360000 },
				(error, token) => {
					if (error) throw error
					res.json({ token })
				}
			)
		} catch (error) {
			console.log(error)
		}
	}
)

module.exports = router
