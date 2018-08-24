const bcrypt = require('bcrypt')
const db = require('../config/db')
const env = require('../config/env')

const initUsers = async () => {
  const saltRounds = 10

  const newAdmin = {
    name: env.ADMIN_NAME,
    username: env.ADMIN_USERNAME,
    role: 'admin',
    passwordHash: await bcrypt.hash(env.ADMIN_PW, saltRounds)
  }
  await db.users.create(newAdmin)

  const newUser = {
    name: env.USER_NAME,
    username: env.USER_USERNAME,
    role: 'user',
    passwordHash: await bcrypt.hash(env.USER_PW, saltRounds)
  }
  await db.users.create(newUser)

  const newDisabledUser = {
    name: env.DISABLED_NAME,
    username: env.DISABLED_USERNAME,
    role: 'disabled',
    passwordHash: await bcrypt.hash(env.DISABLED_PW, saltRounds)
  }
  await db.users.create(newDisabledUser)
}

const initWorkouts = async () => {
  const user = await db.users.find({ where: { username: env.USER_USERNAME } })
  const newWorkout = {
    user_id: user.id,
    date: Date.now()
  }
  await db.workouts.create(newWorkout)
}

const initExercises = async () => {
  const newExercise = {
    name: 'squat',
    description: 'the #1 of all exercises'
  }
  await db.exercises.create(newExercise)
}

const initWorkoutsExercises = async () => {
  const user = await db.users.find({ where: { username: env.USER_USERNAME } })
  const userWorkout = await db.workouts.find({ where: { user_id: user.id } })
  const deadlift = await db.exercises.find({ where: { name: 'squat' } })
  const newWorkoutExercise2 = {
    workout_id: userWorkout.id,
    exercise_id: deadlift.id,
    set_count: 3,
    repetition_count: 5,
    weight: 100
  }
  await db.workoutsExercises.create(newWorkoutExercise2)
}

const initDatabase = async () => {
  await db.sequelize.sync({ force: true })
  await initUsers()
  await initWorkouts()
  await initExercises()
  await initWorkoutsExercises()
}

const adminAuth = {}
const userAuth = {}

const adminLogin = async (api) => {
  const adminCredentials = {
    username: env.ADMIN_USERNAME,
    password: env.ADMIN_PW
  }
  const adminLoginResponse = await api.post('/api/login').send(adminCredentials)
  adminAuth.Authorization = `bearer ${adminLoginResponse.body.token}`
}

const userLogin = async (api) => {
  const userCredentials = {
    username: env.USER_USERNAME,
    password: env.USER_PW
  }
  const userLoginResponse = await api.post('/api/login').send(userCredentials)
  userAuth.Authorization = `bearer ${userLoginResponse.body.token}`
}

module.exports = { initDatabase, adminLogin, adminAuth, userLogin, userAuth }
