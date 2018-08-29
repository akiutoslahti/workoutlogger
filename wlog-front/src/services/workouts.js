import axios from 'axios'

const baseUrl = '/api/users'

let userId = null
let headers = null

const setUser = (user) => {
  userId = user.id
  headers = { headers: { Authorization: `bearer ${user.token}` } }
}

const getUsersWorkouts = async () => {
  const response = await axios.get(`${baseUrl}/${userId}/workouts`, headers)
  return response.data
}

export default { getUsersWorkouts, setUser }
