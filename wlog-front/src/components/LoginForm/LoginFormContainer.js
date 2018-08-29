import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { login } from '../../reducers/loginreducer'
import { initWorkouts } from '../../reducers/workoutreducer'
import { notify } from '../../reducers/notificationreducer'
import loginService from '../../services/login'
import Notification from '../Notification/NotificationContainer'
import LoginForm from './LoginForm'

class LoginFormContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: ''
    }
  }

  fieldChangeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  loginHandler = async (event) => {
    event.preventDefault()
    const { username, password } = this.state
    const { notifyConnect, loginConnect, initWorkoutsConnect } = this.props

    try {
      const user = await loginService.login({
        username,
        password
      })
      window.localStorage.setItem('loggedInUser', JSON.stringify(user))
      this.setState({ username: '', password: '' })
      await loginConnect(user)
      await initWorkoutsConnect(user)
    } catch (exception) {
      this.setState({ username: '', password: '' })
      notifyConnect('username and/or password incorrect', 'error', 5)
    }
  }

  render() {
    const { username, password } = this.state
    return (
      <div>
        <Notification />
        <LoginForm
          fieldChangeHandler={this.fieldChangeHandler}
          loginHandler={this.loginHandler}
          username={username}
          password={password}
        />
      </div>
    )
  }
}

LoginFormContainer.propTypes = {
  loginConnect: PropTypes.func.isRequired,
  notifyConnect: PropTypes.func.isRequired,
  initWorkoutsConnect: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  loginConnect: login,
  notifyConnect: notify,
  initWorkoutsConnect: initWorkouts
}

export default connect(
  null,
  mapDispatchToProps
)(LoginFormContainer)
