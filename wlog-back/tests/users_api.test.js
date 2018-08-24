const supertest = require('supertest')
const uuidv4 = require('uuid/v4')
const { server, app } = require('../index')
const dbTools = require('./dbTools')
const env = require('../config/env')
const db = require('../config/db')

const api = supertest(app)
const baseUrl = '/api/users'

let adminAuth
let admin = null
let userAuth
let user = null

describe('users_api', () => {
  beforeAll(async () => {
    await dbTools.initDatabase()
    await dbTools.adminLogin(api)
    await dbTools.userLogin(api)
    ;({ adminAuth, userAuth } = dbTools)
    admin = await db.users.find({ where: { username: env.ADMIN_USERNAME } })
    user = await db.users.find({ where: { username: env.USER_USERNAME } })
  })

  const expectedProps = ['id', 'name', 'username', 'role']

  describe(`GET ${baseUrl}`, () => {
    test('should return JSON array', async () => {
      const response = await api
        .get(baseUrl)
        .expect(200)
        .set(adminAuth)
        .expect('Content-Type', /application\/json/)
      expect(response.body).toBeInstanceOf(Array)
    })

    test('should return objects w/ correct props', async () => {
      const response = await api
        .get(baseUrl)
        .expect(200)
        .set(adminAuth)
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
        .set(adminAuth)
        .expect('Content-Type', /application\/json/)
      const extraProps = Object.keys(response.body[0]).filter((prop) => {
        !expectedProps.includes(prop)
      })
      expect(extraProps.length).toBe(0)
    })

    test('should 401 without admin rights', async () => {
      await api
        .get(baseUrl)
        .expect(401)
        .set(userAuth)
      await api.get(baseUrl).expect(401)
    })
  })

  describe(`GET ${baseUrl}/:id`, () => {
    test('should return object of type user', async () => {
      const response = await api
        .get(`${baseUrl}/${user.id}`)
        .set(adminAuth)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const returnedUsers = response.body
      expectedProps.forEach((prop) => {
        expect(Object.keys(returnedUsers)).toContain(prop)
      })
      expect(typeof returnedUsers.id).toBe('string')
      expect(typeof returnedUsers.name).toBe('string')
      expect(typeof returnedUsers.username).toBe('string')
      expect(typeof returnedUsers.role).toBe('string')
    })

    test('should return user w/ requested UUID', async () => {
      const response = await api
        .get(`${baseUrl}/${user.id}`)
        .set(adminAuth)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const returnedWorkoutExercise = response.body
      expect(returnedWorkoutExercise).toEqual({
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role
      })
    })

    test('should 400 for request w/ invalid UUID', async () => {
      await api
        .get(`${baseUrl}/-1`)
        .set(adminAuth)
        .expect(400)
    })

    test('should 404 for request w/ non-existing UUID', async () => {
      await api
        .get(`${baseUrl}/${uuidv4()}`)
        .set(adminAuth)
        .expect(404)
    })

    test('should 200 with user priviledges for own UUID', async () => {
      await api
        .get(`${baseUrl}/${user.id}`)
        .set(userAuth)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('should 401 without admin priviledges for other users', async () => {
      await api
        .get(`${baseUrl}/${admin.id}`)
        .set(userAuth)
        .expect(401)
        .expect('Content-Type', /application\/json/)
    })

    test('should 200 with admin priviledges for another user', async () => {
      await api
        .get(`${baseUrl}/${user.id}`)
        .set(adminAuth)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
  })

  describe(`POST ${baseUrl}`, () => {
    const newUser = {
      name: 'Seppo',
      username: 'testi_seppo',
      role: 'user',
      password: 'verysecure'
    }
    const newAdmin = {
      name: 'Admin Seppo',
      username: 'admin_seppo',
      role: 'admin',
      password: 'ultrasecure'
    }

    test('should 201 w/ valid new exercise', async () => {
      const response = await api
        .post(baseUrl)
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      const returnedUser = response.body
      expect(returnedUser.name).toBe(newUser.name)
      expect(returnedUser.username).toBe(newUser.username)
      expect(returnedUser.role).toBe(newUser.role)
    })

    test('should 400 w/o name, username, role or password', async () => {
      const badUsers = []
      for (let i = 0; i < 4; i++) {
        badUsers.push({ ...newUser })
      }
      delete badUsers[0].name
      delete badUsers[1].username
      delete badUsers[2].role
      delete badUsers[3].password
      const promiseArray = badUsers.map((badUser) => {
        return api
          .post(baseUrl)
          .send(badUser)
          .expect(400)
      })
      await Promise.all(promiseArray)
    })

    test('should 409 w/ duplicate', async () => {
      await api
        .post(baseUrl)
        .send(newUser)
        .expect(409)
    })

    test('should 401 w/o admin priviledges for admin creation', async () => {
      await api
        .post(baseUrl)
        .send(newAdmin)
        .expect(401)
      await api
        .post(baseUrl)
        .send(newAdmin)
        .set(userAuth)
        .expect(401)
    })

    test('should 201 w/ admin priviledges for admin creation', async () => {
      await api
        .post(baseUrl)
        .send(newAdmin)
        .set(adminAuth)
        .expect(201)
    })
  })

  describe(`DELETE ${baseUrl}/:id`, () => {
    test('should 401 when deleting someone else', async () => {
      await api
        .delete(`${baseUrl}/${admin.id}`)
        .set(userAuth)
        .expect(401)
    })

    test('should 204 when admin deletes someone else', async () => {
      const seppo = await db.users.find({ where: { username: 'testi_seppo' } })
      await api
        .delete(`${baseUrl}/${seppo.id}`)
        .set(adminAuth)
        .expect(204)
      const userFound = await db.users.find({
        where: { username: 'testi_seppo' }
      })
      expect(userFound).toBeNull()
    })

    test('should 204 when user deletes himself/herself', async () => {
      await api
        .delete(`${baseUrl}/${user.id}`)
        .set(userAuth)
        .expect(204)
      const userFound = await db.users.find({
        where: { username: user.username }
      })
      expect(userFound).toBeNull()
    })

    test('should 401 w/o auth token', async () => {
      await api.delete(`${baseUrl}/${user.id}`).expect(401)
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
    beforeAll(async () => {
      await dbTools.initDatabase()
      await dbTools.adminLogin(api)
      await dbTools.userLogin(api)
      ;({ adminAuth, userAuth } = dbTools)
      admin = await db.users.find({ where: { username: env.ADMIN_USERNAME } })
      user = await db.users.find({ where: { username: env.USER_USERNAME } })
    })

    test('should 200 w/ valid request', async () => {
      const update = {
        updates: {
          name: 'Testi Teppo',
          username: 'teppo',
          password: 'notsecure'
        }
      }
      const response = await api
        .patch(`${baseUrl}/${user.id}`)
        .set(userAuth)
        .send(update)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const returnedUser = response.body
      expect(returnedUser.name).toBe(String(update.updates.name))
    })

    test('should 401 when user tries to patch someone else', async () => {
      await api
        .patch(`${baseUrl}/${admin.id}`)
        .send({ updates: null })
        .set(userAuth)
        .expect(401)
    })

    test('should 200 when admin patches someone else', async () => {
      const update = {
        updates: {
          name: 'Testi Irmeli'
        }
      }
      await api
        .patch(`${baseUrl}/${user.id}`)
        .send(update)
        .set(adminAuth)
        .expect(200)
    })

    test('should 401 when promoting admin w/o admin priviledges', async () => {
      const update = {
        updates: {
          role: 'admin'
        }
      }
      await api
        .patch(`${baseUrl}/${user.id}`)
        .send(update)
        .set(userAuth)
        .expect(401)
    })

    test('should 200 when promoting admin w admin priviledges', async () => {
      const update = {
        updates: {
          role: 'admin'
        }
      }
      const response = await api
        .patch(`${baseUrl}/${user.id}`)
        .send(update)
        .set(adminAuth)
        .expect(200)
      expect(response.body.role).toBe('admin')
    })

    test('should 401 w/o auth token', async () => {
      await api
        .patch(`${baseUrl}/${user.id}`)
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
        .patch(`${baseUrl}/${user.id}`)
        .send()
        .set(userAuth)
        .expect(400)
    })

    test('should 400 w/ id or passwordHash', async () => {
      const badUpdates = [
        {
          updates: { id: uuidv4() }
        },
        {
          updates: { passwordHash: '<adsjsfg97hgu' }
        }
      ]
      const promiseArray = badUpdates.map((badUpdate) => {
        return api
          .patch(`${baseUrl}/${user.id}`)
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
