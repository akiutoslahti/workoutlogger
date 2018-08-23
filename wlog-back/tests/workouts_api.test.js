const supertest = require('supertest')
const { server, app } = require('../index')
const dbTools = require('./dbTools')
const db = require('../config/db')

const api = supertest(app)
const env = require('../config/env')

const baseUrl = '/api/workouts'

let adminAuth
let userAuth
let adminId
let userId

const newWorkoutWithId = (id) => ({
  user_id: id,
  date: new Date()
})

describe.skip('workouts_api', () => {
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
        const createdWorkout = await db.workouts.create(
          newWorkoutWithId(userId)
        )
        await db.workouts.destroy({ where: { id: createdWorkout.id } })
        await api
          .get(`${baseUrl}/${createdWorkout.id}`)
          .set(adminAuth)
          .expect(404)
      })
    })
    test('without authentication', async () => {
      const workout = await db.workouts.find({ where: { user_id: userId } })
      await api.get(`${baseUrl}/${workout.id}`).expect(401)
    })
    describe('authenticated as user', async () => {
      test('for self', async () => {
        const workout = await db.workouts.find({ where: { user_id: userId } })
        await api
          .get(`${baseUrl}/${workout.id}`)
          .set(userAuth)
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })
      test('for others', async () => {
        const workout = await db.workouts.find({ where: { user_id: adminId } })
        await api
          .get(`${baseUrl}/${workout.id}`)
          .set(userAuth)
          .expect(401)
      })
    })
    describe('authenticated as admin', () => {
      test('for others', async () => {
        const workout = await db.workouts.find({ where: { user_id: userId } })
        await api
          .get(`${baseUrl}/${workout.id}`)
          .set(userAuth)
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })
    })
  })

  describe(`POST ${baseUrl}`, () => {
    describe('request validation and sanitization', () => {
      test('without user_id', async () => {
        await api
          .post(baseUrl)
          .send({ date: new Date() })
          .set(adminAuth)
          .expect(400)
      })
      test('without date', async () => {
        await api
          .post(baseUrl)
          .send({ user_id: userId })
          .set(adminAuth)
          .expect(201)
          .expect('Content-Type', /application\/json/)
      })
    })
    test('without authentication', async () => {
      await api
        .post(baseUrl)
        .send(newWorkoutWithId(userId))
        .expect(401)
    })
    describe('authenticated as user', () => {
      test('for self', async () => {
        const newWorkout = newWorkoutWithId(userId)
        await api
          .post(baseUrl)
          .send(newWorkout)
          .set(userAuth)
          .expect(201)
          .expect('Content-Type', /application\/json/)
      })
      test('for others', async () => {
        await api
          .post(baseUrl)
          .send(newWorkoutWithId(adminId))
          .set(userAuth)
          .expect(401)
      })
    })
    describe('authenticated as admin', () => {
      test('for others', async () => {
        await api
          .post(baseUrl)
          .send(newWorkoutWithId(userId))
          .set(adminAuth)
          .expect(201)
          .expect('Content-Type', /application\/json/)
      })
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
      test('non existing workout', async () => {
        const createdWorkout = await db.workouts.create(
          newWorkoutWithId(userId)
        )
        await db.workouts.destroy({ where: { id: createdWorkout.id } })
        await api
          .delete(`${baseUrl}/${createdWorkout.id}`)
          .set(adminAuth)
          .expect(404)
      })
    })
    test('without authentication', async () => {
      const workout = await db.workouts.find({ where: { user_id: userId } })
      await api.delete(`${baseUrl}/${workout.id}`).expect(401)
    })
    describe('authenticated as user', () => {
      test('for self', async () => {
        const workout = await db.workouts.find({ where: { user_id: userId } })
        await api
          .delete(`${baseUrl}/${workout.id}`)
          .set(userAuth)
          .expect(204)
      })
      test('for others', async () => {
        const workout = await db.workouts.find({ where: { user_id: adminId } })
        await api
          .delete(`${baseUrl}/${workout.id}`)
          .set(userAuth)
          .expect(401)
      })
    })
    describe('authenticated as admin', () => {
      test('for others', async () => {
        const workout = await db.workouts.find({ where: { user_id: userId } })
        await api
          .delete(`${baseUrl}/${workout.id}`)
          .set(adminAuth)
          .expect(204)
      })
    })
  })

  describe(`PATCH ${baseUrl}/:id`, () => {
    beforeAll(async () => {
      await api
        .post(baseUrl)
        .set(userAuth)
        .send(newWorkoutWithId(userId))
    })
    describe('request validation and sanitization', () => {
      test('invalid UUID', async () => {
        await api
          .patch(`${baseUrl}/invaliduuid`)
          .set(adminAuth)
          .expect(400)
      })
      test('non existing workout', async () => {
        const createdWorkout = await db.workouts.create(
          newWorkoutWithId(userId)
        )
        await db.workouts.destroy({ where: { id: createdWorkout.id } })
        await api
          .patch(`${baseUrl}/${createdWorkout.id}`)
          .set(adminAuth)
          .expect(404)
      })
      test('patch id', async () => {
        const workout = await db.workouts.find({ where: { user_id: userId } })
        await api
          .patch(`${baseUrl}/${workout.id}`)
          .send({
            updates: {
              id: 'newId'
            }
          })
          .set(adminAuth)
          .expect(400)
      })
      test('patch user_id', async () => {
        const workout = await db.workouts.find({ where: { user_id: userId } })
        await api
          .patch(`${baseUrl}/${workout.id}`)
          .send({
            updates: {
              user_id: 'newId'
            }
          })
          .set(adminAuth)
          .expect(400)
      })
    })
    test('without authentication', async () => {
      const workout = await db.workouts.find({ where: { user_id: userId } })
      await api
        .patch(`${baseUrl}/${workout.id}`)
        .send({
          updates: {
            date: new Date()
          }
        })
        .expect(401)
    })
    describe('authenticated as user', () => {
      test('for self', async () => {
        const workout = await db.workouts.find({ where: { user_id: userId } })
        await api
          .patch(`${baseUrl}/${workout.id}`)
          .set(userAuth)
          .send({
            updates: {
              date: new Date()
            }
          })
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })
      test('for others', async () => {
        const workout = await db.workouts.find({ where: { user_id: adminId } })
        await api
          .patch(`${baseUrl}/${workout.id}`)
          .set(userAuth)
          .send({
            updates: {
              date: new Date()
            }
          })
          .expect(401)
      })
    })
    describe('authenticated as admin', () => {
      test('for others', async () => {
        const workout = await db.workouts.find({ where: { user_id: userId } })
        await api
          .patch(`${baseUrl}/${workout.id}`)
          .set(adminAuth)
          .send({
            updates: {
              date: new Date()
            }
          })
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })
    })
  })

  afterAll(() => {
    server.close()
  })
})
