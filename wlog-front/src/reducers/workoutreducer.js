import workoutService from '../services/workouts'

const initialState = []

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'INIT_WORKOUTS':
      return action.data
    default:
      return state
  }
}

const initWorkouts = (user) => async (dispatch) => {
  workoutService.setUser(user)
  const workouts = await workoutService.getUsersWorkouts()
  dispatch({
    type: 'INIT_WORKOUTS',
    data: workouts
  })
}

export default reducer
export { initWorkouts }
