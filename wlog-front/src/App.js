import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Container } from 'semantic-ui-react'
import LoginForm from './components/LoginForm'
import Navigation from './components/Navigation'
import Notification from './components/Notification'
import { login } from './reducers/loginreducer'

class App extends React.Component {
  componentDidMount = async () => {
    const { loginConnect } = this.props
    const loggedUserJSON = window.localStorage.getItem('loggedInUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      loginConnect(user)
    }
  }

  fieldChangeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  render() {
    const { userlogin } = this.props
    return (
      <Container>
        <Router>
          {userlogin === null ? (
            <LoginForm />
          ) : (
            <div>
              <Navigation />
              <Notification />
              <p>hello world!</p>
            </div>
          )}
        </Router>
      </Container>
    )
  }
}

App.propTypes = {
  userlogin: PropTypes.shape({
    name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired
  }),
  loginConnect: PropTypes.func.isRequired
}

App.defaultProps = {
  userlogin: null
}

const mapStateToProps = (state) => ({
  userlogin: state.userlogin
})

const mapDispatchToProps = {
  loginConnect: login
}

const ConnectedApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export default ConnectedApp
