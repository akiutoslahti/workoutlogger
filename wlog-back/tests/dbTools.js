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
  const admin = await db.users.find({ where: { username: env.ADMIN_USERNAME } })
  const newWorkout1 = {
    user_id: admin.id,
    date: Date.now()
  }
  await db.workouts.create(newWorkout1)

  const user = await db.users.find({ where: { username: env.USER_USERNAME } })
  const newWorkout2 = {
    user_id: user.id,
    date: Date.now()
  }
  await db.workouts.create(newWorkout2)
}

const initExercises = async () => {
  const newExercise1 = {
    name: 'squat',
    description: 'the #1 of all exercises'
  }
  const newExercise2 = {
    name: 'deadlift',
    description: 'great exercise, only second to squat'
  }
  await db.exercises.create(newExercise1)
  await db.exercises.create(newExercise2)
}

const initDatabase = async () => {
  await db.sequelize.sync({ force: true })
  await initUsers()
  await initWorkouts()
  await initExercises()
}

const initWorkoutsExercises = async () => {}

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
