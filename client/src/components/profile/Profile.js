import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import Spinner from '../layout/Spinner'
import { getProfileById } from '../../actions/profile'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import ProfileTop from './ProfileTop'
import ProfileAbout from './ProfileAbout'

const Profile = ({
	match,
	getProfileById,
	profile: { profile, loading },
	auth
}) => {
	useEffect(() => {
		getProfileById(match.params.id)
	}, [])
	return (
		<Fragment>
			{profile === null || loading ? (
				<Spinner />
			) : (
				<Fragment>
					<Link className='btn btn-light' to='/profiles'>
						Back to Profiles
					</Link>
					{auth.isAuthenticated && auth.user._id === profile.user_id && (
						<Link to='/edit-profile' className='btn btn-dark'>
							Edit Profile
						</Link>
					)}
					<div className='profile-grid my-1'>
						<ProfileTop profile={profile} />
						<ProfileAbout profile={profile} />
					</div>
				</Fragment>
			)}
		</Fragment>
	)
}

Profile.propTypes = {
	getProfileById: PropTypes.func.isRequired,
	profile: PropTypes.object.isRequired,
	auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
	profile: state.profile,
	auth: state.auth
})
export default connect(mapStateToProps, { getProfileById })(Profile)
