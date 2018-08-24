import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Form, Button } from 'semantic-ui-react'
import { login } from '../reducers/loginreducer'
import { notify } from '../reducers/notificationreducer'
import loginService from '../services/login'
import Notification from './Notification'

class LoginForm extends React.Component {
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
    const { notifyConnect, loginConnect } = this.props

    try {
      const user = await loginService.login({
        username,
        password
      })
      window.localStorage.setItem('loggedInUser', JSON.stringify(user))
      this.setState({ username: '', password: '' })
      await loginConnect(user)
    } catch (exception) {
      notifyConnect('username and/or password incorrect', 'error', 5)
    }
  }

  render() {
    const { username, password } = this.state
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification />
        <Form onSubmit={this.loginHandler}>
          <Form.Field>
            <label htmlFor="username">
              username
              <input
                name="username"
                id="username"
                type="text"
                value={username}
                onChange={this.fieldChangeHandler}
              />
            </label>
          </Form.Field>
          <Form.Field>
            <label htmlFor="password">
              password
              <input
                name="password"
                id="password"
                type="password"
                value={password}
                onChange={this.fieldChangeHandler}
              />
            </label>
          </Form.Field>
          <Button type="submit">log in</Button>
        </Form>
      </div>
    )
  }
}

LoginForm.propTypes = {
  loginConnect: PropTypes.func.isRequired,
  notifyConnect: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  loginConnect: login,
  notifyConnect: notify
}

const ConnectedLoginForm = connect(
  null,
  mapDispatchToProps
)(LoginForm)

export default ConnectedLoginForm
