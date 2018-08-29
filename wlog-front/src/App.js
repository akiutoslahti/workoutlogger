import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Container } from 'semantic-ui-react'
import LoginForm from './components/LoginForm/LoginFormContainer'
import NavigationBar from './components/NavigationBar/NavigationBarContainer'
import Notification from './components/Notification/NotificationContainer'
import WorkoutList from './components/WorkoutList/WorkoutListContainer'
import { login } from './reducers/loginreducer'
import { initWorkouts } from './reducers/workoutreducer'

class App extends React.Component {
  componentDidMount = async () => {
    const { loginConnect, initWorkoutsConnect } = this.props
    const loggedUserJSON = window.localStorage.getItem('loggedInUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      loginConnect(user)
      initWorkoutsConnect(user)
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
              <NavigationBar />
              <Notification />
              <WorkoutList />
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
  loginConnect: login,
  initWorkoutsConnect: initWorkouts
}

const ConnectedApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export default ConnectedApp
