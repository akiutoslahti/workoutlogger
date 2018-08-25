import React from 'react'
import PropTypes from 'prop-types'
import { Message } from 'semantic-ui-react'

const Notification = ({ notification }) => {
  if (notification.text.length === 0) {
    return null
  }
  if (notification.type === 'error') {
    return (
      <div>
        <Message negative>{notification.text}</Message>
      </div>
    )
  }
  if (notification.type === 'info') {
    return (
      <div>
        <Message positive>{notification.text}</Message>
      </div>
    )
  }
  return null
}

Notification.propTypes = {
  notification: PropTypes.shape({
    text: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  }).isRequired
}

export default Notification
