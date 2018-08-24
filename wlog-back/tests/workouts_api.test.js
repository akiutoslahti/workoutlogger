const supertest = require('supertest')
const uuidv4 = require('uuid/v4')
const { server, app } = require('../index')
const dbTools = require('./dbTools')
const db = require('../config/db')

const api = supertest(app)
const env = require('../config/env')

const baseUrl = '/api/workouts'

let userAuth
let userId
let adminAuth

describe('workouts_api', () => {
  beforeAll(async () => {
    await dbTools.initDatabase()
    await dbTools.userLogin(api)
    await dbTools.adminLogin(api)
    ;({ userAuth, adminAuth } = dbTools)
    const user = await db.users.find({
      where: { username: env.USER_USERNAME }
    })
    userId = user.id
  })

  const expectedProps = ['id', 'user_id', 'date']

  describe(`GET ${baseUrl}`, () => {
    test('should return JSON array', async () => {
      const response = await api
        .get(baseUrl)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      expect(response.body).toBeInstanceOf(Array)
    })

    test('should return objects w/ correct props', async () => {
      const response = await api
        .get(baseUrl)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const responseProps = Object.keys(response.body[0])
      expectedProps.forEach((prop) => {
        expect(responseProps.includes(prop)).toBe(true)
      })
    })

    test('should not return extra props', async () => {
      const response = await api
        .get(baseUrl)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const extraProps = Object.keys(response.body[0]).filter((prop) => {
        !expectedProps.includes(prop)
      })
      expect(extraProps.length).toBe(0)
    })
  })

  describe(`GET ${baseUrl}/:id`, () => {
    let workout = null

    beforeAll(async () => {
      workout = await db.workouts.find()
    })

    test('should return object of type workout', async () => {
      const response = await api
        .get(`${baseUrl}/${workout.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const returnedWorkout = response.body
      expectedProps.forEach((prop) => {
        expect(Object.keys(returnedWorkout)).toContain(prop)
      })
      expect(typeof returnedWorkout.id).toBe('string')
      expect(typeof returnedWorkout.user_id).toBe('string')
      expect(typeof returnedWorkout.date).toBe('string')
    })

    test('should return workout w/ requested UUID', async () => {
      const response = await api
        .get(`${baseUrl}/${workout.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const returnedWorkout = response.body
      expect(returnedWorkout).toEqual({
        id: workout.id,
        user_id: workout.user_id,
        date: String(workout.date)
      })
    })

    test('should 400 for request w/ invalid UUID', async () => {
      await api.get(`${baseUrl}/-1`).expect(400)
    })

    test('should 404 for request w/ non-existing UUID', async () => {
      await api.get(`${baseUrl}/${uuidv4()}`).expect(404)
    })
  })

  describe(`POST ${baseUrl}`, () => {
    const newWorkout = {
      date: Date()
    }

    test('should 201 w/ valid new workout', async () => {
      const response = await api
        .post(baseUrl)
        .send(newWorkout)
        .set(userAuth)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      const returnedExercise = response.body
      expect(returnedExercise.user_id).toBe(userId)
      expect(returnedExercise.date).toBe(String(newWorkout.date))
    })

    test('should 401 w/o auth token', async () => {
      await api
        .post(baseUrl)
        .send(newWorkout)
        .expect(401)
    })
  })

  describe(`DELETE ${baseUrl}/:id`, () => {
    let workout = null

    beforeAll(async () => {
      workout = await db.workouts.find()
    })

    test('should 401 when deleting someone elses workout', async () => {
      await api
        .delete(`${baseUrl}/${workout.id}`)
        .set(adminAuth)
        .expect(401)
    })

    test('should 204 w/ valid request', async () => {
      await api
        .delete(`${baseUrl}/${workout.id}`)
        .set(userAuth)
        .expect(204)
    })

    test('should 401 w/o auth token', async () => {
      await api.delete(`${baseUrl}/${workout.id}`).expect(401)
    })

    test('should 400 for request w/ invalid UUID', async () => {
      await api
        .delete(`${baseUrl}/-1`)
        .set(userAuth)
        .expect(400)
    })

    test('should 404 for request w/ non-existing UUID', async () => {
      await api
        .delete(`${baseUrl}/${uuidv4()}`)
        .set(userAuth)
        .expect(404)
    })
  })

  describe(`PATCH ${baseUrl}/:id`, () => {
    let workout = null

    beforeAll(async () => {
      workout = await db.workouts.find()
    })

    test('should 200 w/ valid request', async () => {
      const update = {
        updates: {
          date: Date()
        }
      }
      const response = await api
        .patch(`${baseUrl}/${workout.id}`)
        .send(update)
        .set(userAuth)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const returnedWorkout = response.body
      expect(returnedWorkout.date).toBe(String(update.updates.date))
    })

    test('should 401 when patching someone elses workout', async () => {
      await api
        .patch(`${baseUrl}/${workout.id}`)
        .send({ updates: null })
        .set(adminAuth)
        .expect(401)
    })

    test('should 401 w/o auth token', async () => {
      await api
        .patch(`${baseUrl}/${workout.id}`)
        .send({ updates: null })
        .expect(401)
    })

    test('should 400 for request w/ invalid UUID', async () => {
      await api
        .patch(`${baseUrl}/-1`)
        .send({ updates: null })
        .set(userAuth)
        .expect(400)
    })

    test('should 404 for request w/ non-existing UUID', async () => {
      await api
        .patch(`${baseUrl}/${uuidv4()}`)
        .send({ updates: null })
        .set(userAuth)
        .expect(404)
    })

    test('should 400 w/o updates', async () => {
      await api
        .patch(`${baseUrl}/${workout.id}`)
        .send()
        .set(userAuth)
        .expect(400)
    })

    test('should 400 w/ id or user_id', async () => {
      const badUpdates = [
        {
          updates: { id: uuidv4() }
        },
        {
          updates: { user_id: uuidv4() }
        }
      ]
      const promiseArray = badUpdates.map((badUpdate) => {
        return api
          .patch(`${baseUrl}/${workout.id}`)
          .send(badUpdate)
          .set(userAuth)
          .then((response) => {
            expect(response.status).toBe(400)
          })
      })
      await Promise.all(promiseArray)
    })
  })

  afterAll(() => {
    server.close()
  })
})
