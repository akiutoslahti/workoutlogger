const initialState = {
  text: '',
  type: ''
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATION':
      return action.message
    case 'CLEAR_NOTIFICATION':
      return initialState
    default:
      return state
  }
}

const setNotification = (text, type) => ({
  type: 'SET_NOTIFICATION',
  message: {
    text,
    type
  }
})

const clearNotification = () => ({
  type: 'CLEAR_NOTIFICATION'
})

const notify = (text, type, time) => (dispatch) => {
  dispatch(setNotification(text, type))
  setTimeout(() => dispatch(clearNotification()), 1000 * time)
}

export default reducer
export { notify }
