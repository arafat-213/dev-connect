import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createComment } from '../../actions/post'

const CommentForm = ({ createComment, postId }) => {
	const [text, setText] = useState('')

	return (
		<div className='post-form'>
			<div className='bg-primary p'>
				<h3>Leave a Comment</h3>
			</div>
			<form
				className='form my-1'
				onSubmit={e => {
					e.preventDefault()
					createComment(postId, { text })
					setText('')
				}}>
				<textarea
					name='text'
					cols='30'
					rows='5'
					placeholder='Add a comment'
					value={text}
					onChange={e => setText(e.target.value)}
					required></textarea>
				<input
					type='submit'
					value='Submit'
					className='btn btn-dark my-1'
				/>
			</form>
		</div>
	)
}

CommentForm.propTypes = {
	createComment: PropTypes.func.isRequired
}

export default connect(null, { createComment })(CommentForm)
