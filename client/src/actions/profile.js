import axios from 'axios'
import { GET_PROFILE, PROFILE_ERROR, UPDATE_PROFILE } from './types'
import { setAlert } from './alert'

// Get current user's profile
export const getCurrentProfile = () => async dispatch => {
	try {
		const res = await axios.get('/api/profile/me')

		dispatch({
			type: GET_PROFILE,
			payload: res.data
		})
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status
			}
		})
	}
}

// Create or update profile
export const createProfile = (
	formData,
	history,
	edit = false
) => async dispatch => {
	try {
		const config = {
			headers: {
				'Content-Type': 'application/json'
			}
		}

		const res = await axios.post('/api/profile', formData, config)

		dispatch({
			type: GET_PROFILE,
			payload: res.data
		})

		dispatch(
			setAlert(edit ? 'Profile updated' : 'Profile created', 'success')
		)

		if (!edit) {
			history.push('/dashboard')
		}
	} catch (err) {
		// Check if errors sent by api
		const errors = err.response.data.errors
		if (errors) {
			errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
		}
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status
			}
		})
	}
}

// Creates/Updates profile experience
export const addExperience = (formData, history) => async dispatch => {
	try {
		const config = {
			headers: {
				'Content-Type': 'application/json'
			}
		}

		const res = await axios.put('/api/profile/experience', formData, config)

		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data
		})

		dispatch(setAlert('Experience updated', 'success'))

		history.push('/dashboard')
	} catch (err) {
		// Check if errors sent by api
		const errors = err.response.data.errors
		if (errors) {
			errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
		}
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status
			}
		})
	}
}

// Creates/Updates profile education
export const addEducation = (formData, history) => async dispatch => {
	try {
		const config = {
			headers: {
				'Content-Type': 'application/json'
			}
		}

		const res = await axios.put('/api/profile/education', formData, config)

		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data
		})

		dispatch(setAlert('Education updated', 'success'))

		history.push('/dashboard')
	} catch (err) {
		// Check if errors sent by api
		const errors = err.response.data.errors
		if (errors) {
			errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
		}
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status
			}
		})
	}
}
