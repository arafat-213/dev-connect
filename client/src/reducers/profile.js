import { GET_PROFILE, PROFILE_ERROR, CLEAR_PROFILE } from '../actions/types'

/* *
 * @params profile : profile of user logged in or the another user whose profile a user visits
 * @params profiles : list of all profiles to display on profiles page
 * @params repos : github repos of current user
 * @params loading: request loading staus
 * @params error : error returned by backend
 */
const initailState = {
	profile: null,
	profiles: [],
	repos: [],
	loading: true,
	error: {}
}
export default function (state = initailState, action) {
	const { type, payload } = action
	switch (type) {
		case GET_PROFILE:
			return {
				...state,
				profile: payload,
				loading: false
			}
		case PROFILE_ERROR:
			return {
				...state,
				error: payload,
				loading: false
			}
		case CLEAR_PROFILE:
			return {
				...state,
				profile: null,
				repos: [],
				loading: false
			}
		default:
			return state
	}
}
