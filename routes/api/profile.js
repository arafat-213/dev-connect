const express = require('express')
const auth = require('../../middleware/auth')

const Profile = require('../../models/Profile')

const router = express.Router()
/*
 *	@route GET api/profile/me
 *	@desc Get current users profile
 *	@access Private
 */
router.get('/me', auth, async (req, res) => {
	try {
		// Fetch profile for current user from DB
		const profile = await Profile.findOne({
			user: req.user.id
		}).populate('user', ['name', 'avatar'])

		// Check if a profile exists
		if (!profile) {
			return res
				.status(400)
				.json({ msg: 'There is no profile for this user' })
		}

		res.json(profile)
	} catch (error) {
		console.error(error.message)
		res.status(400).send('Server Error')
	}
})

module.exports = router
