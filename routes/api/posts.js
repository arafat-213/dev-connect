const express = require('express')
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')

const Post = require('../../models/Post')
const User = require('../../models/User')
const Profile = require('../../models/Profile')

const router = express.Router()

/*
 *	@route POST api/posts
 *	@desc Create a post
 *	@access Private
 */
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

/*
 *	@route GET api/posts
 *	@desc Get all posts
 *	@access Private
 */
router.get('/', auth, async (req, res) => {
	try {
		// Fetch all the posts and sort by date desc order
		const posts = await Post.find().sort({ date: -1 })

		// Send the posts
		res.json(posts)
	} catch (error) {
		console.error(error.message)
		res.status(500).send('Server Error')
	}
})

/*
 *	@route GET api/posts/:post_id
 *	@desc Get a post by post_id
 *	@access Private
 */
router.get('/:post_id', auth, async (req, res) => {
	try {
		// Fetch post for given post_id
		const post = await Post.findById(req.params.post_id)

		// Check if post exists
		if (!post) {
			// Post does not exist
			return res.status(404).json({ msg: 'Post not found' })
		}

		// Post found, send the post
		res.json(post)
	} catch (error) {
		// check if mongoose id validation error
		if (error.name === 'CastError') {
			return res.status(404).json({ msg: 'Post not found' })
		}
		console.error(error.message)
		res.status(500).send('Server Error')
	}
})

/*
 *	@route DELETE api/posts/:post_id
 *	@desc Delete a post by post_id
 *	@access Private
 */
router.delete('/:post_id', auth, async (req, res) => {
	try {
		// Fetch post by post_id
		const post = await Post.findById(req.params.post_id)

		// Check if post exists
		if (!post) {
			// Post does not exists
			return res.status(404).json({ msg: 'Post not found' })
		}

		// Check if user is authorized to delete the post
		if (post.user.toString() !== req.user.id) {
			// User is not authorized to delete the post
			return res.status(401).json({ msg: 'User not authorized' })
		}

		// User is authorized and post exists, Delete it
		await post.remove()

		// Post deleted
		res.json({ msg: 'Post deleted' })
	} catch (error) {
		// check if mongoose id validation error
		if (error.name === 'CastError') {
			return res.status(404).json({ msg: 'Post not found' })
		}
		console.error(error.message)
		res.status(500).send('Server Error')
	}
})

/*
 *	@route PUT api/posts/like/:post_id
 *	@desc Like a post
 *	@access Private
 */
router.put('/like/:post_id', auth, async (req, res) => {
	try {
		// Fetch post by post_id
		const post = await Post.findById(req.params.post_id)

		// Check if post exists
		if (!post) {
			// Post does not exists
			return res.status(404).json({ msg: 'Post not found' })
		}

		// Check if the post has already been liked
		if (post.likes.some(like => like.user.toString() === req.user.id)) {
			return res.status(400).json({ msg: 'Post already liked' })
		}

		// Add a like on post
		post.likes.unshift({ user: req.user.id })

		// Save the post
		await post.save()

		// Send the post
		res.json(post.likes)
	} catch (error) {
		// check if mongoose id validation error
		if (error.name === 'CastError') {
			return res.status(404).json({ msg: 'Post not found' })
		}
		console.error(error.message)
		res.status(500).send('Server Error')
	}
})

/*
 *	@route PUT api/posts/unlike/:post_id
 *	@desc Unlike a post
 *	@access Private
 */
router.put('/unlike/:post_id', auth, async (req, res) => {
	try {
		// Fetch post by post_id
		const post = await Post.findById(req.params.post_id)

		// Check if post exists
		if (!post) {
			// Post does not exists
			return res.status(404).json({ msg: 'Post not found' })
		}

		// Check if the post has been liked by this user
		if (!post.likes.some(like => like.user.toString() === req.user.id)) {
			return res.status(400).json({ msg: 'Post has not been liked' })
		}

		// Remove the like on post
		post.likes = post.likes.filter(
			({ user }) => user.toString() !== req.user.id
		)

		// Save the post
		await post.save()

		// Send the post
		res.json(post.likes)
	} catch (error) {
		// check if mongoose id validation error
		if (error.name === 'CastError') {
			return res.status(404).json({ msg: 'Post not found' })
		}
		console.error(error.message)
		res.status(500).send('Server Error')
	}
})

/*
 *	@route POST api/posts/comment/:post_id
 *	@desc Make comment on a post
 *	@access Private
 */
router.post(
	'/comment/:post_id',
	[auth, check('text', 'Text is required').not().isEmpty()],
	async (req, res) => {
		try {
			// Check if req data is valid
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				// Validation failed
				return res.status(400).json({ errors: errors.array() })
			}

			// Get the user to associate with this comment
			const user = await User.findById(req.user.id).select('-password')

			// Get the post on which comment is beign made by post_id
			const post = await Post.findById(req.params.post_id)

			// Build an object for new comment
			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id
			}

			// Save the comment on Post
			post.comments.unshift(newComment)

			// Save the post in DB
			await post.save()

			// Send the comments
			res.json(post.comments)
		} catch (error) {
			console.log(error.message)
			res.status(500).send('Server error')
		}
	}
)

/*
 *	@route DELETE api/posts/comment/:post_id/:comment_id
 *	@desc Delete comment from a post
 *	@access Private
 */
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
	try {
		// Fetch post
		const post = await Post.findById(req.params.post_id)

		// Get comment from the post
		const comment = post.comments.find(
			comment => comment.id === req.params.comment_id
		)

		// Check if comment exists
		if (!comment) {
			return res.status(404).json({ msg: 'Comment not found' })
		}

		// Check if user is authorized to delete the comment
		if (comment.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' })
		}

		// Filter out the comment
		post.comments = post.comments.filter(
			({ id }) => id !== req.params.comment_id
		)

		// Save the post
		await post.save()

		// Return the comments
		return res.json(post.comments)
	} catch (error) {
		// check if mongoose id validation error
		if (error.name === 'CastError') {
			return res.status(404).json({ msg: 'Post not found' })
		}
		console.error(error.message)
		res.status(500).send('Server Error')
	}
})
module.exports = router
