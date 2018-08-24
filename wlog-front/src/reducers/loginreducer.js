const reducer = (state = null, action) => {
  switch (action.type) {
    case 'LOGIN':
      return action.data
    case 'LOGOUT':
      return null
    default:
      return state
  }
}

const login = (user) => async (dispatch) => {
  dispatch({
    type: 'LOGIN',
    data: user
  })
}

const logout = () => async (dispatch) => {
  dispatch({
    type: 'LOGOUT'
  })
}

export default reducer
export { login, logout }
