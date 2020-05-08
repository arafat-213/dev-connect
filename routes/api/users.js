const express = require('express')
const { check, validationResult } = require('express-validator')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const User = require('../../models/User')

const router = express.Router()

/*
 * @route POST api/users
 * @desc Register user
 * @access Public
 */

router.post(
	'/',
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Please enter a valid email').isEmail(),
		check(
			'password',
			'Please enter a password with 6 or more characters'
		).isLength({ min: 6 })
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { name, email, password } = req.body
		try {
			// TODO
			// See if user exists
			let user = await User.findOne({ email })
			if (user) {
				return res.status(400).json({
					errors: [{ msg: 'User already exists' }]
				})
			}

			// Get users gravatar
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm'
			})

			// Create instance of User model
			user = new User({
				name,
				email,
				password,
				avatar
			})

			// Encrypt password
			const salt = await bcrypt.genSalt(10)
			user.password = await bcrypt.hash(password, salt)

			// Save user into DB
			await user.save()

			// TODO: Return jsonwebtoken
			res.status(201).send('User registered')
		} catch (error) {
			console.log(error)
		}
	}
)

module.exports = router
