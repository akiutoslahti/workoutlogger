import axios from 'axios'

const baseUrl = '/api/workouts'

let userId = null
let authHeader = null

const setUser = ({ user }) => {
  userId = user.id
  authHeader = {
    Authorization: `bearer ${user.token}`
  }
}

const getAll = async () => {
  const response = await axios.post(`${baseUrl}/${userId}/workouts`, authHeader)
  return response.data
}

export default { setUser, getAll }
