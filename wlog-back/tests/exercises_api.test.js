const supertest = require('supertest')
const { server, app } = require('../index')
const dbTools = require('./dbTools')
const db = require('../config/db')

const api = supertest(app)
const env = require('../config/env')

const baseUrl = '/api/exercises'

let userAuth
let userId

const newExerciseWithName = (name) => ({
  name,
  description: 'generic exercise'
})

describe('exercises_api', () => {
  beforeAll(async () => {
    await dbTools.initDatabase()
    await dbTools.adminLogin(api)
    await dbTools.userLogin(api)
    ;({ userAuth } = dbTools)
    const user = await db.users.find({
      where: { username: env.USER_USERNAME }
    })
    userId = user.id
  })

  describe(`GET ${baseUrl}`, () => {
    test('without authentication', async () => {
      await api
        .get(baseUrl)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
  })

  describe(`GET ${baseUrl}/:id`, () => {
    describe('request validation and sanitization', () => {
      test('invalid UUID', async () => {
        await api.get(`${baseUrl}/invaliduuid`).expect(400)
      })
      test('non existing exercise', async () => {
        const exercise = await db.exercises.create(
          newExerciseWithName('nonexisting')
        )
        await db.exercises.destroy({ where: { id: exercise.id } })
        await api.get(`${baseUrl}/${exercise.id}`).expect(404)
      })
    })

    test('get existing valid exercise', async () => {
      const exercise = await db.exercises.find()
      await api
        .get(`${baseUrl}/${exercise.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
  })

  describe(`POST ${baseUrl}`, () => {
    describe('request validation and sanitization', () => {
      test('without name', async () => {
        await api
          .post(baseUrl)
          .set(userAuth)
          .send({ description: 'without name' })
          .expect(400)
      })

      test('duplicate', async () => {
        await db.exercises.create(newExerciseWithName('duplicate'))
        await api
          .post(baseUrl)
          .set(userAuth)
          .send(newExerciseWithName('duplicate'))
          .expect(409)
      })
    })

    test('without authentication', async () => {
      await api
        .post(baseUrl)
        .send(newExerciseWithName('exercise1'))
        .expect(401)
    })

    test('with authentication', async () => {
      const newExercise = newExerciseWithName('exercise2')
      const response = await api
        .post(baseUrl)
        .set(userAuth)
        .send(newExercise)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      delete response.body.id
      expect(response.body).toEqual(newExercise)
    })
  })

  describe(`DELETE ${baseUrl}/:id`, () => {
    describe('request validation and sanitization', () => {
      test('invalid UUID', async () => {
        await api
          .delete(`${baseUrl}/invaliduuid`)
          .set(userAuth)
          .expect(400)
      })

      test('non existing exercise', async () => {
        const exercise = await db.exercises.create(
          newExerciseWithName('nonexisting')
        )
        await db.exercises.destroy({ where: { id: exercise.id } })
        await api
          .delete(`${baseUrl}/${exercise.id}`)
          .set(userAuth)
          .expect(404)
      })
    })

    test('without authentication', async () => {
      const exercise = await db.exercises.create(
        newExerciseWithName('exercise3')
      )
      await api.delete(`${baseUrl}/${exercise.id}`).expect(401)
    })

    describe('with authentication', () => {
      test('exercise without use', async () => {
        const exercise = await db.exercises.create(
          newExerciseWithName('exercise3')
        )
        await api
          .delete(`${baseUrl}/${exercise.id}`)
          .set(userAuth)
          .expect(204)
      })

      test('exercise with use', async () => {
        const exercise = await db.exercises.create(
          newExerciseWithName('exercise3')
        )
        const workout = await db.workouts.create({
          user_id: userId
        })
        await db.workoutsExercises.create({
          workout_id: workout.id,
          exercise_id: exercise.id,
          set_count: 3,
          repetition_count: 5,
          weight: 100
        })
        await api
          .delete(`${baseUrl}/${exercise.id}`)
          .set(userAuth)
          .expect(400)
      })
    })
  })

  describe(`PATCH ${baseUrl}/:id`, () => {
    describe('request validation and sanitization', () => {
      test('invalid UUID', async () => {
        await api
          .patch(`${baseUrl}/invaliduuid`)
          .set(userAuth)
          .expect(400)
      })

      test('non existing UUID', async () => {
        const exercise = await db.exercises.create(
          newExerciseWithName('nonexisting')
        )
        await db.exercises.destroy({ where: { id: exercise.id } })
        await api
          .patch(`${baseUrl}/${exercise.id}`)
          .set(userAuth)
          .expect(404)
      })

      test('id cannot be changed', async () => {
        const exercise = await db.exercises.create(
          newExerciseWithName('exercise4')
        )
        await api
          .patch(`${baseUrl}/${exercise.id}`)
          .send({
            updates: { id: 'newUUID' }
          })
          .set(userAuth)
          .expect(400)
      })

      test('name cannot be changed', async () => {
        const exercise = await db.exercises.create(
          newExerciseWithName('exercise5')
        )
        await api
          .patch(`${baseUrl}/${exercise.id}`)
          .send({
            updates: { name: 'patched' }
          })
          .set(userAuth)
          .expect(400)
      })
    })

    test('without authentication', async () => {
      const exercise = await db.exercises.create(
        newExerciseWithName('exercise6')
      )
      await api
        .patch(`${baseUrl}/${exercise.id}`)
        .send({
          updates: { description: 'patched' }
        })
        .expect(401)
    })

    test('patch description', async () => {
      const exercise = await db.exercises.create(
        newExerciseWithName('exercise7')
      )
      await api
        .patch(`${baseUrl}/${exercise.id}`)
        .set(userAuth)
        .send({
          updates: { description: 'patched' }
        })
        .expect(200)
    })
  })

  afterAll(() => {
    server.close()
  })
})
