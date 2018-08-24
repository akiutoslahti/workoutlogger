const supertest = require('supertest')
const uuidv4 = require('uuid/v4')
const { server, app } = require('../index')
const dbTools = require('./dbTools')
const db = require('../config/db')

const api = supertest(app)
const baseUrl = '/api/exercises'

describe('exercises_api', () => {
  beforeAll(async () => {
    await dbTools.initDatabase()
  })

  const expectedProps = ['id', 'name', 'description']

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
      const extraProps = Object.keys(response.body[0]).filter((prop) => !expectedProps.includes(prop))
      expect(extraProps.length).toBe(0)
    })
  })

  describe(`GET ${baseUrl}/:id`, () => {
    let exercise = null

    beforeAll(async () => {
      exercise = await db.exercises.find()
    })

    test('should return object of type exercise', async () => {
      const response = await api
        .get(`${baseUrl}/${exercise.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const returnedExercise = response.body
      expectedProps.forEach((prop) => {
        expect(Object.keys(returnedExercise)).toContain(prop)
      })
      expect(typeof returnedExercise.id).toBe('string')
      expect(typeof returnedExercise.name).toBe('string')
      expect(typeof returnedExercise.description).toBe('string')
    })

    test('should return exercise w/ requested UUID', async () => {
      const response = await api
        .get(`${baseUrl}/${exercise.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const returnedExercise = response.body
      expect(returnedExercise).toEqual({
        id: exercise.id,
        name: exercise.name,
        description: exercise.description
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
    const newExercise = {
      name: 'bench press',
      description: 'highly overrated exercise'
    }

    test('should 201 w/ valid new exercise', async () => {
      const response = await api
        .post(baseUrl)
        .send(newExercise)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      const returnedExercise = response.body
      expect(returnedExercise.name).toBe(newExercise.name)
      expect(returnedExercise.description).toBe(newExercise.description)
    })

    test('should 400 w/o name', async () => {
      const badExercise = {
        description: 'bad exercise'
      }
      await api
        .post(baseUrl)
        .send(badExercise)
        .expect(400)
    })

    test('should 409 w/ duplicate', async () => {
      await api
        .post(baseUrl)
        .send(newExercise)
        .expect(409)
    })
  })

  describe(`DELETE ${baseUrl}/:id`, () => {
    test('should 204 w/ exercise w/o use', async () => {
      const exercise = {
        name: 'pull-up',
        description: 'for those awesome lateral back muscles'
      }
      const createdExercise = await db.exercises.create(exercise)
      await api.delete(`${baseUrl}/${createdExercise.id}`).expect(204)
      const exerciseFound = await db.exercises.find({
        where: { id: createdExercise.id }
      })
      expect(exerciseFound).toBeNull()
    })

    test('should 400 w/ exercise w/ use', async () => {
      const workoutExercise = await db.workoutsExercises.find()
      await api.delete(`${baseUrl}/${workoutExercise.exercise_id}`).expect(400)
      const exerciseFound = await db.exercises.find({
        where: { id: workoutExercise.exercise_id }
      })
      expect(exerciseFound).toBeDefined()
    })

    test('should 400 for request w/ invalid UUID', async () => {
      await api.delete(`${baseUrl}/-1`).expect(400)
    })

    test('should 404 for request w/ non-existing UUID', async () => {
      await api.delete(`${baseUrl}/${uuidv4()}`).expect(404)
    })
  })

  describe(`PATCH ${baseUrl}/:id`, () => {
    let exercise = null

    beforeAll(async () => {
      exercise = await db.exercises.find()
    })

    test('should 200 w/ valid request', async () => {
      const update = {
        updates: {
          description: 'newDescription'
        }
      }
      const response = await api
        .patch(`${baseUrl}/${exercise.id}`)
        .send(update)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const returnedExercise = response.body
      expect(returnedExercise.description).toBe(update.updates.description)
    })

    test('should 400 for request w/ invalid UUID', async () => {
      await api.patch(`${baseUrl}/-1`).expect(400)
    })

    test('should 404 for request w/ non-existing UUID', async () => {
      await api.patch(`${baseUrl}/${uuidv4()}`).expect(404)
    })

    test('should 400 w/o updates', async () => {
      await api
        .patch(`${baseUrl}/${exercise.id}`)
        .send()
        .expect(400)
    })

    test('should 400 w/ id or name', async () => {
      const badUpdates = [
        {
          updates: { name: 'newName' }
        },
        {
          updates: { id: uuidv4() }
        }
      ]
      const promiseArray = badUpdates.map((badUpdate) =>
        api
          .patch(`${baseUrl}/${exercise.id}`)
          .send(badUpdate)
          .then((response) => {
            expect(response.status).toBe(400)
          })
      )
      await Promise.all(promiseArray)
    })
  })

  afterAll(() => {
    server.close()
  })
})
