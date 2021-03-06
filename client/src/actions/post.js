import axios from 'axios'
import { setAlert } from './alert'
import {
	GET_POSTS,
	POST_ERROR,
	UPDATE_LIKES,
	DELETE_POST,
	CREATE_POST,
	GET_POST,
	CREATE_COMMENT,
	DELETE_COMMENT
} from './types'

// Get posts
export const getPosts = () => async dispatch => {
	try {
		const res = await axios.get(`/api/posts`)
		dispatch({
			type: GET_POSTS,
			payload: res.data
		})
	} catch (error) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: error.response.statusText,
				status: error.response.status
			}
		})
	}
}

// Add a like to a post
export const addLike = id => async dispatch => {
	try {
		const res = await axios.put(`/api/posts/like/${id}`)
		dispatch({
			type: UPDATE_LIKES,
			payload: { id, likes: res.data }
		})
	} catch (error) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: error.response.statusText,
				status: error.response.status
			}
		})
	}
}

// Remove a like from a post
export const removeLike = id => async dispatch => {
	try {
		const res = await axios.put(`/api/posts/unlike/${id}`)
		dispatch({
			type: UPDATE_LIKES,
			payload: { id, likes: res.data }
		})
	} catch (error) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: error.response.statusText,
				status: error.response.status
			}
		})
	}
}

// Delete a post
export const deletePost = id => async dispatch => {
	try {
		await axios.delete(`/api/posts/${id}`)
		console.log('triggered')
		dispatch({
			type: DELETE_POST,
			payload: id
		})

		dispatch(setAlert('Post removed', 'success'))
	} catch (error) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: error.response.statusText,
				status: error.response.status
			}
		})
	}
}

// Create a post
export const createPost = formData => async dispatch => {
	const config = {
		header: {
			'Content-Type': 'application/json'
		}
	}
	try {
		const res = await axios.post(`/api/posts/`, formData, config)
		console.log('triggered')
		dispatch({
			type: CREATE_POST,
			payload: res.data
		})
		dispatch(setAlert('Post created', 'success'))
	} catch (error) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: error.response.statusText,
				status: error.response.status
			}
		})
	}
}

export const getPost = id => async dispatch => {
	try {
		const res = await axios.get(`/api/posts/${id}`)

		dispatch({
			type: GET_POST,
			payload: res.data
		})
	} catch (error) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: error.response.statusText,
				status: error.response.status
			}
		})
	}
}

// Create a comment
export const createComment = (postId, formData) => async dispatch => {
	const config = {
		header: {
			'Content-Type': 'application/json'
		}
	}
	try {
		const res = await axios.post(
			`/api/posts/comment/${postId}`,
			formData,
			config
		)
		console.log('triggered')
		dispatch({
			type: CREATE_COMMENT,
			payload: res.data
		})
		dispatch(setAlert('Comment Added', 'success'))
	} catch (error) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: error.response.statusText,
				status: error.response.status
			}
		})
	}
}

// Delete a comment
export const deleteComment = (postId, commentId) => async dispatch => {
	try {
		const res = await axios.delete(
			`/api/posts/comment/${postId}/${commentId}`
		)
		console.log('triggered')
		dispatch({
			type: DELETE_COMMENT,
			payload: commentId
		})
		dispatch(setAlert('Comment Deleted', 'success'))
	} catch (error) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: error.response.statusText,
				status: error.response.status
			}
		})
	}
}
