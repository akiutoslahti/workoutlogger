import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Notification from './Notification'

const NotificationContainer = ({ notification }) => <Notification notification={notification} />

NotificationContainer.propTypes = {
  notification: PropTypes.shape({
    text: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  }).isRequired
}

const mapStateToProps = (state) => ({
  notification: state.notification
})

export default connect(mapStateToProps)(NotificationContainer)
