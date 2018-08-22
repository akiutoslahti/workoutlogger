const supertest = require('supertest')
const { server, app } = require('../index')
const { initDatabase } = require('./initDatabase')
const env = require('../config/env')
const db = require('../config/db')

const api = supertest(app)
const baseUrl = '/api/users'

const formatUser = (user) => {
  const formattedUser = user.toJSON()
  delete formattedUser.passwordHash
  delete formattedUser.created_at
  delete formattedUser.updated_at
  return formattedUser
}

const userWithName = (name) => ({
  name: 'testuser',
  username: name,
  password: `${name}12345!`,
  role: 'user'
})

describe('users_api', () => {
  const adminAuth = {}
  const userAuth = {}
  beforeAll(async () => {
    await initDatabase()
    const adminCredentials = {
      username: env.ADMIN_USERNAME,
      password: env.ADMIN_PW
    }
    const adminLoginResponse = await api
      .post('/api/login')
      .send(adminCredentials)
    adminAuth.Authorization = `bearer ${adminLoginResponse.body.token}`
    const userCredentials = {
      username: env.USER_USERNAME,
      password: env.USER_PW
    }
    const userLoginResponse = await api.post('/api/login').send(userCredentials)
    userAuth.Authorization = `bearer ${userLoginResponse.body.token}`
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
      test('on self', async () => {
        const admin = await db.users.find({
          where: { username: env.ADMIN_USERNAME }
        })
        const response = await api
          .get(`${baseUrl}/${admin.id}`)
          .set(adminAuth)
          .expect(200)
          .expect('Content-Type', /application\/json/)
        expect(response.body).toEqual(formatUser(admin))
      })
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
    describe('requestcontentcontent validation and sanitization', () => {
      test('empty', async () => {
        await api
          .post(baseUrl)
          .send({})
          .expect(400)
      })
      test('no username', async () => {
        const newUser = userWithName('testuser0')
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
        const newUser = userWithName('testuser0')
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
        const newUser = userWithName('testuser0')
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
        const newUser = userWithName('testuser0')
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
        const newUser = userWithName('testuser0')
        newUser.role = 'disabled'
        await api
          .post(baseUrl)
          .send(newUser)
          .expect(400)
      })
    })
    describe('without authentication', () => {
      test('create new user', async () => {
        const newUser = userWithName('testuser1')
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
        const newUser = userWithName('testuser2')
        newUser.role = 'admin'
        await api
          .post(baseUrl)
          .send(newUser)
          .expect(401)
      })
    })
    describe('authenticated as user', () => {
      test('create new admin', async () => {
        const newUser = userWithName('testuser3')
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
        const newUser = userWithName('testuser4')
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
    // without authentication: not allowed
    // authenticated as user: allowed only for self
    // autheticated as admin: allowed
    describe('request validation and sanitization', () => {
      test('invalid UUID', async () => {
        await api
          .delete(`${baseUrl}/invaliduuid`)
          .set(adminAuth)
          .expect(400)
      })
      test('non existing user', async () => {
        const newUser = userWithName('tobedeleted0')
        const createdUser = await api.post('/api/users').send(newUser)
        await api
          .delete(`${baseUrl}/${createdUser.body.id}`)
          .set(adminAuth)
          .expect(204)
        await api
          .delete(`${baseUrl}/${createdUser.body.id}`)
          .set(adminAuth)
          .expect(404)
      })
    })
    test('without authentication', async () => {
      const newUser = userWithName('tobedeleted1')
      const createdUser = await api.post('/api/users').send(newUser)
      await api.delete(`${baseUrl}/${createdUser.id}`).expect(401)
    })
    describe('authenticated as user', async () => {
      test('on self', async () => {
        const newUser = userWithName('tobedeleted2')
        const createdUser = await api.post('/api/users').send(newUser)
        const credentials = {
          username: newUser.username,
          password: newUser.password
        }
        const userLoginResponse = await api.post('/api/login').send(credentials)
        const delAuth = {
          Authorization: `bearer ${userLoginResponse.body.token}`
        }
        await api
          .delete(`${baseUrl}/${createdUser.body.id}`)
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
      test('on self', async () => {
        const user = await db.users.find({
          where: { username: env.ADMIN_USERNAME }
        })
        await api
          .delete(`${baseUrl}/${user.id}`)
          .set(adminAuth)
          .expect(204)
      })
      test('on others', async () => {
        const newUser = userWithName('tobedeleted3')
        const createdUser = await api.post('/api/users').send(newUser)
        await api
          .delete(`${baseUrl}/${createdUser.body.id}`)
          .set(adminAuth)
          .expect(204)
      })
    })
  })

  describe.skip('PATCH /api/users/:id', () => {
    // without authentication: not allowed
    // authenticated as user: allowed only for self
    // autheticated as admin: allowed
    describe('request validation and sanitization', () => {
      test('invalid UUID', async () => {
        await api.patch(`${baseUrl}/invaliduuid`).expect(400)
      })
      test('', async () => {})
    })
    describe('without authentication', () => {
      test('', async () => {})
    })
    describe('authenticated as user', () => {
      test('', async () => {})
    })
    describe('authenticated as admin', () => {
      test('', async () => {})
    })
  })

  afterAll(() => {
    server.close()
  })
})
