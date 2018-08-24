import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import notificationreducer from './reducers/notificationreducer'
import loginreducer from './reducers/loginreducer'

const reducer = combineReducers({
  notification: notificationreducer,
  userlogin: loginreducer
})

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk)))

export default store
