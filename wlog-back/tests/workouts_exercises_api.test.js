const supertest = require('supertest')
const { server, app } = require('../index')
const dbTools = require('./dbTools')
const db = require('../config/db')

const api = supertest(app)
const env = require('../config/env')

const baseUrl = '/api/workoutsexercises'

let adminAuth
let userAuth
let adminId
let userId

const randomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max))
}

const newWorkoutExercise = async () => {
  const workout = await db.workouts.find({ where: { user_id: userId } })
  const exercise = await db.exercises.find()
  return {
    workout_id: workout.id,
    exercise_id: exercise.id,
    set_count: randomInt(5) + 1,
    repetition_count: randomInt(10) + 1,
    weight: randomInt(70) + 50
  }
}

describe('workoutsexercises_api', () => {
  beforeAll(async () => {
    await dbTools.initDatabase()
    await dbTools.adminLogin(api)
    await dbTools.userLogin(api)
    ;({ adminAuth, userAuth } = dbTools)
    const admin = await db.users.find({
      where: { username: env.ADMIN_USERNAME }
    })
    adminId = admin.id
    const user = await db.users.find({
      where: { username: env.USER_USERNAME }
    })
    userId = user.id
  })

  describe(`GET ${baseUrl}`, () => {
    test('without authentication', async () => {
      await api.get(baseUrl).expect(401)
    })
    test('authenticated as user', async () => {
      await api
        .get(baseUrl)
        .set(userAuth)
        .expect(401)
    })
    test('authenticated as admin', async () => {
      await api
        .get(baseUrl)
        .set(adminAuth)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
  })

  describe(`GET ${baseUrl}/:id`, () => {
    describe('request validation and sanitization', () => {
      test('invalid UUID', async () => {
        await api
          .get(`${baseUrl}/invaliduuid`)
          .set(adminAuth)
          .expect(400)
      })

      test('non existing workout', async () => {
        const createdWorkoutExercise = await db.workoutsExercises.create(
          await newWorkoutExercise()
        )
        await db.workoutsExercises.destroy({
          where: { id: createdWorkoutExercise.id }
        })
        await api
          .get(`${baseUrl}/${createdWorkoutExercise.id}`)
          .set(adminAuth)
          .expect(404)
      })
    })

    test('without authentication', async () => {
      const workoutExercise = await db.workoutsExercises.find()
      await api.get(`${baseUrl}/${workoutExercise.id}`).expect(401)
    })

    describe('authenticated as user', async () => {
      test('for self', async () => {
        const workout = await db.workouts.find({ where: { user_id: userId } })
        const workoutExercise = await db.workoutsExercises.find({
          where: { workout_id: workout.id }
        })
        await api
          .get(`${baseUrl}/${workoutExercise.id}`)
          .set(userAuth)
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })

      test('for others', async () => {
        const workout = await db.workouts.find({ where: { user_id: adminId } })
        const workoutExercise = await db.workoutsExercises.find({
          where: { workout_id: workout.id }
        })
        await api
          .get(`${baseUrl}/${workoutExercise.id}`)
          .set(userAuth)
          .expect(401)
      })
    })

    describe('authenticated as admin', async () => {
      test('for others', async () => {
        const workout = await db.workouts.find({ where: { user_id: userId } })
        const workoutExercise = await db.workoutsExercises.find({
          where: { workout_id: workout.id }
        })
        await api
          .get(`${baseUrl}/${workoutExercise.id}`)
          .set(adminAuth)
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })
    })
  })

  describe(`POST ${baseUrl}`, () => {
    describe('request validation and sanitization', () => {
      test('invalid exercise_id', async () => {
        const workoutExercise = await newWorkoutExercise()
        workoutExercise.exercise_id = 'invalid'
        await api
          .post(baseUrl)
          .set(userAuth)
          .send(workoutExercise)
          .expect(400)
      })

      test('invalid workout_id', async () => {
        const workoutExercise = await newWorkoutExercise()
        workoutExercise.exercise_id = 'invalid'
        await api
          .post(baseUrl)
          .set(userAuth)
          .send(workoutExercise)
          .expect(400)
      })

      test('non existing exercise_id', async () => {
        const workoutExercise = await newWorkoutExercise()
        workoutExercise.exercise_id = 'ff9ee9e6-58f7-48d8-8f5b-935cb84ed41e'
        await api
          .post(baseUrl)
          .set(userAuth)
          .send(workoutExercise)
          .expect(404)
      })

      test('non existing workout_id', async () => {
        const workoutExercise = await newWorkoutExercise()
        workoutExercise.workout_id = 'ff9ee9e6-58f7-48d8-8f5b-935cb84ed41e'
        await api
          .post(baseUrl)
          .set(userAuth)
          .send(workoutExercise)
          .expect(404)
      })

      test('non existing set_count', async () => {
        const workoutExercise = await newWorkoutExercise()
        delete workoutExercise.set_count
        await api
          .post(baseUrl)
          .set(userAuth)
          .send(workoutExercise)
          .expect(400)
      })

      test('non existing repetition_count', async () => {
        const workoutExercise = await newWorkoutExercise()
        delete workoutExercise.repetition_count
        await api
          .post(baseUrl)
          .set(userAuth)
          .send(workoutExercise)
          .expect(400)
      })

      test('non existing weight', async () => {
        const workoutExercise = await newWorkoutExercise()
        delete workoutExercise.weight
        await api
          .post(baseUrl)
          .set(userAuth)
          .send(workoutExercise)
          .expect(400)
      })
    })

    test('without authentication', async () => {
      const workoutExercise = await newWorkoutExercise()
      await api
        .post(baseUrl)
        .send(workoutExercise)
        .expect(401)
    })

    test('authenticated', async () => {
      const workoutExercise = await newWorkoutExercise()
      await api
        .post(baseUrl)
        .set(userAuth)
        .send(workoutExercise)
        .expect(201)
    })
  })

  describe(`DELETE ${baseUrl}/:id`, () => {
    describe('request validation and sanitization', () => {
      test('invalid UUID', async () => {
        await api
          .delete(`${baseUrl}/invaliduuid`)
          .set(adminAuth)
          .expect(400)
      })

      test('non existing workoutExercise', async () => {
        const workoutExercise = await newWorkoutExercise()
        const createdWorkoutExercise = await db.workoutsExercises.create(
          workoutExercise
        )
        await db.workoutsExercises.destroy({
          where: { id: createdWorkoutExercise.id }
        })
        await api
          .delete(`${baseUrl}/${createdWorkoutExercise.id}`)
          .set(adminAuth)
          .expect(404)
      })
    })

    test('without authentication', async () => {
      const workoutExercise = await newWorkoutExercise()
      const createdWorkoutExercise = await db.workoutsExercises.create(
        workoutExercise
      )
      await api.delete(`${baseUrl}/${createdWorkoutExercise.id}`).expect(401)
    })

    describe('authenticated as user', () => {
      test('for self', async () => {
        const workoutExercise = await newWorkoutExercise()
        const createdWorkoutExercise = await db.workoutsExercises.create(
          workoutExercise
        )
        await api
          .delete(`${baseUrl}/${createdWorkoutExercise.id}`)
          .set(userAuth)
          .expect(204)
      })

      test('for others', async () => {
        const workout = await db.workouts.find({ where: { user_id: adminId } })
        const exercise = await db.exercises.find()
        const workoutExercise = {
          workout_id: workout.id,
          exercise_id: exercise.id,
          set_count: randomInt(5) + 1,
          repetition_count: randomInt(10) + 1,
          weight: randomInt(70) + 50
        }
        const createdWorkoutExercise = await db.workoutsExercises.create(
          workoutExercise
        )
        await api
          .delete(`${baseUrl}/${createdWorkoutExercise.id}`)
          .set(userAuth)
          .expect(401)
      })
    })

    describe('authenticated as admin', () => {
      test('for others', async () => {
        const workoutExercise = await newWorkoutExercise()
        const createdWorkoutExercise = await db.workoutsExercises.create(
          workoutExercise
        )
        await api
          .delete(`${baseUrl}/${createdWorkoutExercise.id}`)
          .set(adminAuth)
          .expect(204)
      })
    })
  })

  describe(`PATCH ${baseUrl}/:id`, () => {
    describe('request validation and sanitization', () => {
      test('invalid UUID', async () => {
        await api
          .patch(`${baseUrl}/invaliduuid`)
          .set(adminAuth)
          .expect(400)
      })

      test('non existing workoutExercise', async () => {
        const workoutExercise = await newWorkoutExercise()
        const createdWorkoutExercise = await db.workoutsExercises.create(
          workoutExercise
        )
        await db.workoutsExercises.destroy({
          where: { id: createdWorkoutExercise.id }
        })
        await api
          .patch(`${baseUrl}/${createdWorkoutExercise.id}`)
          .set(adminAuth)
          .expect(404)
      })

      test('patch id', async () => {
        const workoutExercise = await newWorkoutExercise()
        await api
          .patch(`${baseUrl}/${workoutExercise.id}`)
          .set(adminAuth)
          .send({
            updates: {
              id: 'notallowed'
            }
          })
          .expect(400)
      })
    })

    test('without authentication', async () => {
      const workoutExercise = await newWorkoutExercise()
      await api
        .patch(`${baseUrl}/${workoutExercise.id}`)
        .send()
        .expect(401)
    })

    describe('authenticated as user', () => {
      test('for self', async () => {
        const workoutExercise = await newWorkoutExercise()
        const createdWorkoutExercise = await db.workoutsExercises.create(
          workoutExercise
        )
        await api
          .patch(`${baseUrl}/${createdWorkoutExercise.id}`)
          .set(userAuth)
          .send({
            updates: {
              weight: 100
            }
          })
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })

      test('for others', async () => {
        const workout = await db.workouts.find({ where: { user_id: adminId } })
        const exercise = await db.exercises.find()
        const workoutExercise = {
          workout_id: workout.id,
          exercise_id: exercise.id,
          set_count: randomInt(5) + 1,
          repetition_count: randomInt(10) + 1,
          weight: randomInt(70) + 50
        }
        const createdWorkoutExercise = await db.workoutsExercises.create(
          workoutExercise
        )
        await api
          .patch(`${baseUrl}/${createdWorkoutExercise.id}`)
          .set(userAuth)
          .send({ updates: { weight: 100 } })
          .expect(401)
      })
    })

    describe('authenticated as admin', () => {
      test('for others', async () => {
        const workoutExercise = await newWorkoutExercise()
        const createdWorkoutExercise = await db.workoutsExercises.create(
          workoutExercise
        )
        await api
          .patch(`${baseUrl}/${createdWorkoutExercise.id}`)
          .send({ updates: { weight: 100 } })
          .set(adminAuth)
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })
    })
  })

  afterAll(() => {
    server.close()
  })
})
