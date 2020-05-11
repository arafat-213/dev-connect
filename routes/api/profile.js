const express = require('express')
const request = require('request')
const config = require('config')
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')
const Profile = require('../../models/Profile')
const User = require('../../models/User')

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

/*
 *	@route POST api/profile/
 *	@desc Create or update current users profile
 *	@access Private
 */
router.post(
	'/',
	[
		auth,
		[
			check('status', 'Status is required').not().isEmpty(),
			check('skills', 'Skills is required').not().isEmpty()
		]
	],
	async (req, res) => {
		// validation for req
		const errors = validationResult(req)

		// checking if req data is valid
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		// Valid request
		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin
		} = req.body

		// Build profile object
		const profileFields = {}
		profileFields.user = req.user.id
		if (company) profileFields.company = company
		if (website) profileFields.website = website
		if (location) profileFields.location = location
		if (bio) profileFields.bio = bio
		if (status) profileFields.status = status
		if (githubusername) profileFields.githubusername = githubusername
		if (skills) {
			profileFields.skills = skills.split(',').map(skill => skill.trim())
		}

		// Build social objects
		profileFields.social = {}
		if (youtube) profileFields.social.youtube = youtube
		if (twitter) profileFields.social.twitter = twitter
		if (facebook) profileFields.social.facebook = facebook
		if (linkedin) profileFields.social.linkedin = linkedin
		if (instagram) profileFields.social.instagram = instagram

		// Store profile data in DB
		try {
			// Fetch the profile to check if already exists
			let profile = await Profile.findOne({ user: req.user.id })

			if (profile) {
				// Profile exists, update the profile
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				)

				// Send the profile
				return res.json(profile)
			}

			// Profile does not exists, create a new one.
			profile = new Profile(profileFields)

			// Save the new profile
			await profile.save()

			// Send the profile
			res.status(201).json(profile)
		} catch (error) {
			console.error(error.message)
			res.status(500).send('Server error')
		}
	}
)

/*
 *	@route GET api/profile/
 *	@desc Get all profiles
 *	@access Public
 */
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', [
			'name',
			'avatar'
		])
		res.json(profiles)
	} catch (error) {
		console.error(error)
		res.status(500).send('Server error')
	}
})

/*
 *	@route GET api/profile/user/:user_id
 *	@desc Get profile by user id
 *	@access Public
 */
router.get('/user/:user_id', async (req, res) => {
	try {
		// Fetch profile for user id passed in url
		const profile = await Profile.findOne({
			user: req.params.user_id
		}).populate('user', ['name', 'avatar'])

		// check if profile exists
		if (!profile)
			return res.status(404).json({ msg: 'Profile does not exist' })

		//profile exists
		res.json(profile)
	} catch (error) {
		console.error(error)
		// check if mongoose user id validation error
		if (error.name === 'CastError') {
			return res.status(404).json({ msg: 'Profile does not exist' })
		}
		res.status(500).send('Server error')
	}
})

/*
 *	@route DELETE api/profile/
 *	@desc Delete profile, user & posts
 *	@access Private
 */
router.delete('/', auth, async (req, res) => {
	try {
		// TODO: Remove users posts

		// Remove profile
		await Profile.findOneAndRemove({ user: req.user.id })

		// Remove user
		await User.findOneAndRemove({ _id: req.user.id })

		res.json({ msg: 'User deleted' })
	} catch (error) {
		console.error(error.message)
		res.status(500).send('Server error')
	}
})

/*
 *	@route PUT api/profile/experience
 *	@desc Add profile experience
 *	@access Private
 */
router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is required').not().isEmpty(),
			check('company', 'Company is required').not().isEmpty(),
			check('from', 'From data is required').not().isEmpty()
		]
	],
	async (req, res) => {
		// Validate the req fields
		const errors = validationResult(req)

		// check if any error occured in validation
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		// request fields validation passed
		const {
			title,
			company,
			location,
			to,
			from,
			current,
			description
		} = req.body

		// create a new experience object
		const newExp = {
			title,
			company,
			location,
			to,
			from,
			current,
			description
		}

		// put the experince data in profile document
		try {
			// fetch the user profile
			const profile = await Profile.findOne({ user: req.user.id })

			// pushing the experience data on profile object
			// unshift() adds the data on first index, unlike push() which add data on last index
			profile.experience.unshift(newExp)

			// save data in DB
			await profile.save()

			// send the profile with experience data added
			res.json(profile)
		} catch (error) {
			console.error(error.message)
			res.status(500).send('Server error')
		}
	}
)

/*
 *	@route DELETE api/profile/experience/:exp_id
 *	@desc Delete experience from profile
 *	@access Private
 */
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		// Get the user profile
		const profile = await Profile.findOne({ user: req.user.id })

		// Filters the experience of passed param id
		profile.experience = profile.experience.filter(
			exp => exp._id.toString() !== req.params.exp_id
		)

		// Save the filtered profile (removed experience for :exp_id)
		await profile.save()

		// send the profile
		res.json(profile)
	} catch (error) {}
})

/*
 *	@route PUT api/profile/education
 *	@desc Add profile experience
 *	@access Private
 */
router.put(
	'/education',
	[
		auth,
		[
			check('school', 'School is required').not().isEmpty(),
			check('degree', 'Degree is required').not().isEmpty(),
			check('fieldofstudy', 'Field of study is required').not().isEmpty(),
			check('from', 'From date is required').not().isEmpty()
		]
	],
	async (req, res) => {
		// Validate the req fields
		const errors = validationResult(req)

		// check if any error occured in validation
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		// request fields validation passed
		const {
			school,
			degree,
			fieldofstudy,
			to,
			from,
			current,
			description
		} = req.body

		// create a new education object
		const newEdu = {
			school,
			degree,
			fieldofstudy,
			to,
			from,
			current,
			description
		}

		// put the education data in profile document
		try {
			// fetch the user profile
			const profile = await Profile.findOne({ user: req.user.id })

			// pushing the education data on profile object
			// unshift() adds the data on first index, unlike push() which add data on last index
			profile.education.unshift(newEdu)

			// save data in DB
			await profile.save()

			// send the profile with education data added
			res.json(profile)
		} catch (error) {
			console.error(error.message)
			res.status(500).send('Server error')
		}
	}
)

/*
 *	@route DELETE api/profile/education/:edu_id
 *	@desc Delete education from profile
 *	@access Private
 */
router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		// Get the user profile
		const profile = await Profile.findOne({ user: req.user.id })

		// Filters the education of passed param id
		profile.education = profile.education.filter(
			edu => edu._id.toString() !== req.params.edu_id
		)

		// Save the filtered profile (removed education for :exp_id)
		await profile.save()

		// send the profile
		res.json(profile)
	} catch (error) {}
})

/*
 *	@route GET api/profile/github/:username
 *	@desc Get user repos from github
 *	@access Public
 */
router.get('/github/:username', async (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${
				req.params.username
			}/repos?per_page=5&sort=created:asc&client_id=${config.get(
				'githubClientId'
			)}&client_secret=${config.get('githubSecret')}`,
			method: 'GET',
			headers: { 'user-agent': 'node.js' }
		}

		request(options, (error, response, body) => {
			if (error) console.error(error.message)

			// Check if profile/repos are found
			if (response.statusCode !== 200) {
				// No github profile found for given username
				return res.status(404).json({ msg: 'No Github profile found' })
			}

			// Github repos found
			res.json(JSON.parse(body))
		})
	} catch (error) {
		console.error(error.message)
		res.status(500).send('Server Error')
	}
})

module.exports = router
