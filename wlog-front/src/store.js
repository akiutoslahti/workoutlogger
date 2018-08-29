import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import notificationreducer from './reducers/notificationreducer'
import loginreducer from './reducers/loginreducer'
import workoutreducer from './reducers/workoutreducer'

const reducer = combineReducers({
  notification: notificationreducer,
  userlogin: loginreducer,
  workouts: workoutreducer
})

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk)))

export default store
