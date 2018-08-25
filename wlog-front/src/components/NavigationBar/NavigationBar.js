import React from 'react'
import PropTypes from 'prop-types'
import { Menu, Button } from 'semantic-ui-react'

const NavigationBar = ({ userLogin, logoutHandler }) => {
  const italic = {
    fontStyle: 'italic'
  }

  return (
    <div>
      <Menu>
        <Menu.Item header>workout logger app</Menu.Item>
        <Menu.Item>
          <span style={italic}>{userLogin.name} logged in </span>
        </Menu.Item>
        <Menu.Item>
          <Button type="button" onClick={logoutHandler}>
            logout
          </Button>
        </Menu.Item>
      </Menu>
    </div>
  )
}

NavigationBar.propTypes = {
  userLogin: PropTypes.shape({
    name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired
  }).isRequired,
  logoutHandler: PropTypes.func.isRequired
}

export default NavigationBar
