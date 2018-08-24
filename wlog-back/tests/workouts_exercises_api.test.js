const supertest = require('supertest')
const uuidv4 = require('uuid/v4')
const { server, app } = require('../index')
const dbTools = require('./dbTools')
const db = require('../config/db')

const api = supertest(app)

const baseUrl = '/api/workoutsexercises'

let adminAuth
let userAuth

describe('workoutsexercises_api', () => {
  beforeAll(async () => {
    await dbTools.initDatabase()
    await dbTools.adminLogin(api)
    await dbTools.userLogin(api)
    ;({ adminAuth, userAuth } = dbTools)
  })

  const expectedProps = [
    'id',
    'workout_id',
    'exercise_id',
    'set_count',
    'repetition_count',
    'weight'
  ]

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
    let workoutExercise = null

    beforeAll(async () => {
      workoutExercise = await db.workoutsExercises.find()
    })

    test('should return object of type workoutExercise', async () => {
      const response = await api
        .get(`${baseUrl}/${workoutExercise.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const returnedWorkoutExercise = response.body
      expectedProps.forEach((prop) => {
        expect(Object.keys(returnedWorkoutExercise)).toContain(prop)
      })
      expect(typeof returnedWorkoutExercise.id).toBe('string')
      expect(typeof returnedWorkoutExercise.workout_id).toBe('string')
      expect(typeof returnedWorkoutExercise.exercise_id).toBe('string')
      expect(typeof returnedWorkoutExercise.set_count).toBe('number')
      expect(typeof returnedWorkoutExercise.repetition_count).toBe('number')
      expect(typeof returnedWorkoutExercise.weight).toBe('number')
    })

    test('should return workoutExercise w/ requested UUID', async () => {
      const response = await api
        .get(`${baseUrl}/${workoutExercise.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const returnedWorkoutExercise = response.body
      expect(returnedWorkoutExercise).toEqual({
        id: workoutExercise.id,
        workout_id: workoutExercise.workout_id,
        exercise_id: workoutExercise.exercise_id,
        set_count: workoutExercise.set_count,
        repetition_count: workoutExercise.repetition_count,
        weight: workoutExercise.weight
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
    let newWorkoutExercise = null

    beforeAll(async () => {
      const workout = await db.workouts.find()
      const exercise = await db.exercises.find()
      newWorkoutExercise = {
        workout_id: workout.id,
        exercise_id: exercise.id,
        set_count: 3,
        repetition_count: 5,
        weight: 100
      }
    })

    test('should 201 w/ valid new workoutExercise', async () => {
      const response = await api
        .post(baseUrl)
        .send(newWorkoutExercise)
        .set(userAuth)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      const returnedWorkoutExercise = response.body
      expect(returnedWorkoutExercise.exercise_id).toBe(
        newWorkoutExercise.exercise_id
      )
      expect(returnedWorkoutExercise.set_count).toBe(
        newWorkoutExercise.set_count
      )
      expect(returnedWorkoutExercise.repetition_count).toBe(
        newWorkoutExercise.repetition_count
      )
      expect(returnedWorkoutExercise.weight).toBe(newWorkoutExercise.weight)
    })

    test('should 401 w/o auth token', async () => {
      await api
        .post(baseUrl)
        .send(newWorkoutExercise)
        .expect(401)
        .expect('Content-Type', /application\/json/)
    })

    test('should 400 w/o workout_id, exercise_id, set_count, repetition_count or weight', async () => {
      const badWorkoutsExercises = []
      for (let i = 0; i < 5; i++) {
        badWorkoutsExercises.push({ ...newWorkoutExercise })
      }
      delete badWorkoutsExercises[0].workout_id
      delete badWorkoutsExercises[1].exercise_id
      delete badWorkoutsExercises[2].set_count
      delete badWorkoutsExercises[3].repetition_count
      delete badWorkoutsExercises[4].weight
      const promiseArray = badWorkoutsExercises.map((badWorkoutExercise) => {
        return api
          .post(baseUrl)
          .send(badWorkoutExercise)
          .set(userAuth)
          .then((response) => {
            expect(response.status).toBe(400)
          })
      })
      await Promise.all(promiseArray)
    })

    test('should 404 w/ non-existing workout_id or exercise_id', async () => {
      const badWorkoutsExercises = []
      for (let i = 0; i < 2; i++) {
        badWorkoutsExercises.push({ ...newWorkoutExercise })
      }
      badWorkoutsExercises[0].workout_id = uuidv4()
      badWorkoutsExercises[1].exercise_id = uuidv4()
      const promiseArray = badWorkoutsExercises.map((badWorkoutExercise) => {
        return api
          .post(baseUrl)
          .send(badWorkoutExercise)
          .set(userAuth)
          .then((response) => {
            expect(response.status).toBe(404)
          })
      })
      await Promise.all(promiseArray)
    })

    test('should 401 w/o auth token', async () => {
      await api
        .post(baseUrl)
        .send(newWorkoutExercise)
        .expect(401)
    })

    test('should 401 when workout is someone elses', async () => {
      await api
        .post(baseUrl)
        .send(newWorkoutExercise)
        .set(adminAuth)
        .expect(401)
    })
  })

  describe(`DELETE ${baseUrl}/:id`, () => {
    let workoutExercise = null

    beforeAll(async () => {
      workoutExercise = await db.workoutsExercises.find()
    })

    test('should 401 when deleting someone elses workoutExercise', async () => {
      await api
        .delete(`${baseUrl}/${workoutExercise.id}`)
        .set(adminAuth)
        .expect(401)
    })

    test('should 204 w/ valid request', async () => {
      await api
        .delete(`${baseUrl}/${workoutExercise.id}`)
        .set(userAuth)
        .expect(204)
    })

    test('should 401 w/o auth token', async () => {
      await api.delete(`${baseUrl}/${workoutExercise.id}`).expect(401)
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
    let workoutExercise = null

    beforeAll(async () => {
      workoutExercise = await db.workoutsExercises.find()
    })

    test('should 200 w/ valid request', async () => {
      const update = {
        updates: {
          weight: 80
        }
      }
      const response = await api
        .patch(`${baseUrl}/${workoutExercise.id}`)
        .send(update)
        .set(userAuth)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const returnedWorkoutExercise = response.body
      expect(returnedWorkoutExercise.weight).toBe(update.updates.weight)
    })

    test('should 401 when patching someone elses workoutExercise', async () => {
      await api
        .patch(`${baseUrl}/${workoutExercise.id}`)
        .send({ updates: null })
        .set(adminAuth)
        .expect(401)
    })

    test('should 401 w/o auth token', async () => {
      await api
        .patch(`${baseUrl}/${workoutExercise.id}`)
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
        .patch(`${baseUrl}/${workoutExercise.id}`)
        .send()
        .set(userAuth)
        .expect(400)
    })

    test('should 400 w/ id, workout_id or exercise_id', async () => {
      const badUpdates = [
        {
          updates: { id: uuidv4() }
        },
        {
          updates: { workout_id: uuidv4() }
        },
        {
          updates: { exercise_id: uuidv4() }
        }
      ]
      const promiseArray = badUpdates.map((badUpdate) => {
        return api
          .patch(`${baseUrl}/${workoutExercise.id}`)
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
