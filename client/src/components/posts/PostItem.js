import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Moment from 'react-moment'
import { connect } from 'react-redux'
import { addLike, removeLike } from '../../actions/post'

const PostItem = ({
	auth,
	post: { _id, text, name, avatar, user, likes, comments, date },
	addLike,
	removeLike
}) => {
	return (
		<div className='post bg-white p-1 my-1'>
			<div>
				<a href='profile.html'>
					<img src={avatar} alt='user avatar' className='round-img' />
					<h4>{name}</h4>
				</a>
			</div>
			<div>
				<p className='my-1'>{text}</p>
				<p className='post-date'>
					Posted at <Moment format='HH:MM, DD-MM-YYYY'>{date}</Moment>
				</p>
				<button
					onClick={e => addLike(_id)}
					className='btn btn-light'
					type='button'>
					<i className='fas fa-thumbs-up'></i>
					<span>
						{likes.length > 0 && <span> {likes.length}</span>}
					</span>
				</button>
				<button
					onClick={e => removeLike(_id)}
					className='btn btn-light'
					type='button'>
					<i className='fas fa-thumbs-down'></i>
				</button>
				<Link to={`/posts/${_id}`} className='btn btn-primary'>
					Discussion{' '}
					{comments.length > 0 && (
						<span className='comment-count'>{comments.length}</span>
					)}
				</Link>
				{!auth.loading && user === auth.user._id && (
					<button className='btn btn-danger' type='button'>
						<i className='fas fa-times'></i>
					</button>
				)}
			</div>
		</div>
	)
}

PostItem.propTypes = {
	post: PropTypes.object.isRequired,
	auth: PropTypes.object.isRequired,
	addLike: PropTypes.func.isRequired,
	removeLike: PropTypes.func.isRequired
}

const mapStateToProps = state => {
	return {
		auth: state.auth
	}
}

export default connect(mapStateToProps, { addLike, removeLike })(PostItem)
