const express = require('express')
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')

const Post = require('../../models/Post')
const User = require('../../models/User')
const Profile = require('../../models/Profile')

const router = express.Router()

// @route POST api/posts
// @desc Create a post
// @access Private
router.post(
	'/',
	[auth, check('text', 'Text is required').not().isEmpty()],
	async (req, res) => {
		try {
			// Check if req data is valid
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				// Validation failed
				return res.status(400).json({ errors: errors.array() })
			}

			// Get the user to associate with this post
			const user = await User.findById(req.user.id).select('-password')

			// Build an object for Post model
			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id
			})

			// Save the post in DB
			const post = await newPost.save()

			// Send the post
			res.json(post)
		} catch (error) {
			console.log(error.message)
			res.status(500).send('Server error')
		}
	}
)

module.exports = router
