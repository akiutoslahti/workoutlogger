import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Menu, Button } from 'semantic-ui-react'
import { logout } from '../reducers/loginreducer'

const Navigation = ({ userlogin, logoutConnect }) => {
  const logoutHandler = () => {
    window.localStorage.removeItem('loggedInUser')
    logoutConnect()
  }

  const italic = {
    fontStyle: 'italic'
  }

  return (
    <div>
      <Menu>
        <Menu.Item header>workout logger app</Menu.Item>
        <Menu.Item>
          <span style={italic}>{userlogin.name} logged in </span>
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

Navigation.propTypes = {
  userlogin: PropTypes.shape({
    name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired
  }).isRequired,
  logoutConnect: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  userlogin: state.userlogin
})

const mapDispatchToProps = {
  logoutConnect: logout
}

const ConnectedNavigation = connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigation)

export default ConnectedNavigation
