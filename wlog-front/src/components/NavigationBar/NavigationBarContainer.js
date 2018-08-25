import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { logout } from '../../reducers/loginreducer'
import NavigationBar from './NavigationBar'

const NavigationBarContainer = ({ userLogin, logoutConnect }) => {
  const logoutHandler = () => {
    window.localStorage.removeItem('loggedInUser')
    logoutConnect()
  }

  return <NavigationBar userLogin={userLogin} logoutHandler={logoutHandler} />
}

NavigationBarContainer.propTypes = {
  userLogin: PropTypes.shape({
    name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired
  }).isRequired,
  logoutConnect: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  userLogin: state.userlogin
})

const mapDispatchToProps = {
  logoutConnect: logout
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationBarContainer)
