const supertest = require('supertest')
const bcrypt = require('bcrypt')
const { server, app } = require('../index')
const dbTools = require('./dbTools')
const env = require('../config/env')
const db = require('../config/db')

const saltRounds = 10

const api = supertest(app)
const baseUrl = '/api/users'

const formatUser = (user) => {
  const formattedUser = user.toJSON()
  delete formattedUser.passwordHash
  delete formattedUser.created_at
  delete formattedUser.updated_at
  return formattedUser
}

const createUserWithName = (name) => ({
  name: 'testuser',
  username: name,
  password: `${name}12345!`,
  role: 'user'
})

let adminAuth
let userAuth

describe.skip('users_api', () => {
  beforeAll(async () => {
    await dbTools.initDatabase()
    await dbTools.adminLogin(api)
    await dbTools.userLogin(api)
    ;({ adminAuth, userAuth } = dbTools)
  })

  describe('GET /api/users', () => {
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

  describe('GET /api/users/:id', () => {
    describe('request validation and sanitization', () => {
      test('invalid UUID', async () => {
        await api
          .get(`${baseUrl}/invaliduuid`)
          .set(adminAuth)
          .expect(400)
      })
      test('non existing user', async () => {
        const newUser = createUserWithName('tobedeleted0')
        newUser.passwordHash = await bcrypt.hash(newUser.password, saltRounds)
        delete newUser.password
        const createdUser = await db.users.create(newUser)
        await db.users.destroy({ where: { id: createdUser.id } })
        await api
          .get(`${baseUrl}/${createdUser.id}`)
          .set(adminAuth)
          .expect(404)
      })
    })
    test('without authentication', async () => {
      const user = await db.users.find({
        where: { username: env.USER_USERNAME }
      })
      await api.get(`${baseUrl}/${user.id}`).expect(401)
    })
    describe('authenticated as user', () => {
      test('on self', async () => {
        const user = await db.users.find({
          where: { username: env.USER_USERNAME }
        })
        const response = await api
          .get(`${baseUrl}/${user.id}`)
          .set(userAuth)
          .expect(200)
          .expect('Content-Type', /application\/json/)
        expect(response.body).toEqual(formatUser(user))
      })
      test('on others', async () => {
        const disabled = await db.users.find({
          where: { username: env.DISABLED_USERNAME }
        })
        await api
          .get(`${baseUrl}/${disabled.id}`)
          .set(userAuth)
          .expect(401)
      })
    })
    describe('authenticated as admin', () => {
      test('on others', async () => {
        const user = await db.users.find({
          where: { username: env.USER_USERNAME }
        })
        const response = await api
          .get(`${baseUrl}/${user.id}`)
          .set(adminAuth)
          .expect(200)
          .expect('Content-Type', /application\/json/)
        expect(response.body).toEqual(formatUser(user))
      })
    })
  })

  describe('POST /api/users', () => {
    describe('request content validation and sanitization', () => {
      test('empty', async () => {
        await api
          .post(baseUrl)
          .send({})
          .expect(400)
      })
      test('no username', async () => {
        const newUser = createUserWithName('testuser0')
        newUser.username = ''
        await api
          .post(baseUrl)
          .send(newUser)
          .expect(400)
        delete newUser.username
        await api
          .post(baseUrl)
          .send(newUser)
          .expect(400)
      })
      test('no name', async () => {
        const newUser = createUserWithName('testuser0')
        newUser.name = ''
        await api
          .post(baseUrl)
          .send(newUser)
          .expect(400)
        delete newUser.name
        await api
          .post(baseUrl)
          .send(newUser)
          .expect(400)
      })
      test('no password', async () => {
        const newUser = createUserWithName('testuser0')
        newUser.password = ''
        await api
          .post(baseUrl)
          .send(newUser)
          .expect(400)
        delete newUser.password
        await api
          .post(baseUrl)
          .send(newUser)
          .expect(400)
      })
      test('no role', async () => {
        const newUser = createUserWithName('testuser0')
        newUser.role = ''
        await api
          .post(baseUrl)
          .send(newUser)
          .expect(400)
        delete newUser.role
        await api
          .post(baseUrl)
          .send(newUser)
          .expect(400)
      })
      test('no disabled role', async () => {
        const newUser = createUserWithName('testuser0')
        newUser.role = 'disabled'
        await api
          .post(baseUrl)
          .send(newUser)
          .expect(400)
      })
    })
    describe('without authentication', () => {
      test('create new user', async () => {
        const newUser = createUserWithName('testuser1')
        const response = await api
          .post(baseUrl)
          .send(newUser)
          .expect(201)
          .expect('Content-Type', /application\/json/)
        delete newUser.password
        delete response.body.id
        expect(response.body).toEqual(newUser)
      })
      test('create new admin', async () => {
        const newUser = createUserWithName('testuser2')
        newUser.role = 'admin'
        await api
          .post(baseUrl)
          .send(newUser)
          .expect(401)
      })
    })
    describe('authenticated as user', () => {
      test('create new admin', async () => {
        const newUser = createUserWithName('testuser3')
        newUser.role = 'admin'
        await api
          .post(baseUrl)
          .set(userAuth)
          .send(newUser)
          .expect(401)
      })
    })
    describe('authenticated as admin', () => {
      test('create new admin', async () => {
        const newUser = createUserWithName('testuser4')
        newUser.role = 'admin'
        const response = await api
          .post(baseUrl)
          .set(adminAuth)
          .send(newUser)
          .expect(201)
          .expect('Content-Type', /application\/json/)
        delete newUser.password
        delete response.body.id
        expect(response.body).toEqual(newUser)
      })
    })
  })

  describe('DELETE /api/users/:id', () => {
    describe('request validation and sanitization', () => {
      test('invalid UUID', async () => {
        await api
          .delete(`${baseUrl}/invaliduuid`)
          .set(adminAuth)
          .expect(400)
      })
      test('non existing user', async () => {
        const newUser = createUserWithName('tobedeleted0')
        newUser.passwordHash = await bcrypt.hash(newUser.password, saltRounds)
        delete newUser.password
        const createdUser = await db.users.create(newUser)
        await db.users.destroy({ where: { id: createdUser.id } })
        await api
          .delete(`${baseUrl}/${createdUser.id}`)
          .set(adminAuth)
          .expect(404)
      })
    })
    test('without authentication', async () => {
      const newUser = createUserWithName('tobedeleted1')
      newUser.passwordHash = await bcrypt.hash(newUser.password, saltRounds)
      delete newUser.password
      const createdUser = await db.users.create(newUser)
      await api.delete(`${baseUrl}/${createdUser.id}`).expect(401)
    })
    describe('authenticated as user', async () => {
      test('on self', async () => {
        const newUser = createUserWithName('tobedeleted2')
        const credentials = {
          username: newUser.username,
          password: newUser.password
        }
        newUser.passwordHash = await bcrypt.hash(newUser.password, saltRounds)
        delete newUser.password
        const createdUser = await db.users.create(newUser)
        const userLoginResponse = await api.post('/api/login').send(credentials)
        const delAuth = {
          Authorization: `bearer ${userLoginResponse.body.token}`
        }
        await api
          .delete(`${baseUrl}/${createdUser.id}`)
          .set(delAuth)
          .expect(204)
      })
      test('on others', async () => {
        const user = await db.users.find({
          where: { username: env.DISABLED_USERNAME }
        })
        await api
          .delete(`${baseUrl}/${user.id}`)
          .set(userAuth)
          .expect(401)
      })
    })
    describe('authenticated as admin', () => {
      test('on others', async () => {
        const newUser = createUserWithName('tobedeleted3')
        newUser.passwordHash = await bcrypt.hash(newUser.password, saltRounds)
        delete newUser.password
        const createdUser = await db.users.create(newUser)
        await api
          .delete(`${baseUrl}/${createdUser.id}`)
          .set(adminAuth)
          .expect(204)
      })
    })
  })

  describe('PATCH /api/users/:id', () => {
    describe('request validation and sanitization', () => {
      test('invalid UUID', async () => {
        await api
          .patch(`${baseUrl}/invaliduuid`)
          .set(adminAuth)
          .expect(400)
      })
      test('non existing user', async () => {
        const newUser = createUserWithName('tobedeleted0')
        newUser.passwordHash = await bcrypt.hash(newUser.password, saltRounds)
        delete newUser.password
        const createdUser = await db.users.create(newUser)
        await db.users.destroy({ where: { id: createdUser.id } })
        await api
          .patch(`${baseUrl}/${createdUser.id}`)
          .set(adminAuth)
          .expect(404)
      })
      test('patch passwordHash', async () => {
        const user = await db.users.find({
          where: { username: env.USER_USERNAME }
        })
        await api
          .patch(`${baseUrl}/${user.id}`)
          .set(adminAuth)
          .send({
            updates: {
              passwordHash: 'asdasd'
            }
          })
          .expect(400)
      })
    })
    test('without authentication', async () => {
      const newUser = createUserWithName('tobepatched1')
      newUser.passwordHash = await bcrypt.hash(newUser.password, saltRounds)
      delete newUser.password
      const createdUser = await db.users.create(newUser)
      await api.patch(`${baseUrl}/${createdUser.id}`).expect(401)
    })
    describe('authenticated as user', () => {
      test('on self', async () => {
        const user = await db.users.find({
          where: { username: env.USER_USERNAME }
        })
        const response = await api
          .patch(`${baseUrl}/${user.id}`)
          .set(userAuth)
          .send({
            updates: {
              name: 'patched'
            }
          })
          .expect(200)
          .expect('Content-Type', /application\/json/)
        expect(response.body.name).toBe('patched')
      })
      test('on others', async () => {
        const user = await db.users.find({
          where: { username: env.DISABLED_USERNAME }
        })
        await api
          .patch(`${baseUrl}/${user.id}`)
          .set(userAuth)
          .send({
            updates: {
              name: 'patched'
            }
          })
          .expect(401)
      })
    })
    describe('authenticated as admin', () => {
      test('on others', async () => {
        const user = await db.users.find({
          where: { username: env.USER_USERNAME }
        })
        const response = await api
          .patch(`${baseUrl}/${user.id}`)
          .set(adminAuth)
          .send({
            updates: {
              name: env.USER_USERNAME
            }
          })
          .expect(200)
        expect(response.body.name).toBe(env.USER_USERNAME)
      })
    })
  })

  afterAll(() => {
    server.close()
  })
})
