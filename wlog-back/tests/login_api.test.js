const supertest = require('supertest')
const { server, app } = require('../index')
const dbTools = require('./dbTools')

const api = supertest(app)
const env = require('../config/env')

const baseUrl = '/api/login'

describe.skip('login_api', () => {
  beforeAll(async () => {
    await dbTools.initDatabase()
  })
  describe('POST /api/login', () => {
    describe('request validation and sanitization', () => {
      test('no password and username', async () => {
        await api
          .post(baseUrl)
          .send()
          .expect(400)
      })
      test('no password', async () => {
        await api
          .post(baseUrl)
          .send({ username: env.ADMIN_USERNAME })
          .expect(400)
      })
      test('no username', async () => {
        await api
          .post(baseUrl)
          .send({ password: env.ADMIN_PW })
          .expect(400)
      })
      test('non existent user', async () => {
        const credentials = {
          username: 'nonexisting',
          password: 'wrongpassword'
        }
        await api
          .post(baseUrl)
          .send(credentials)
          .expect(404)
      })
      test('wrong password', async () => {
        const credentials = {
          username: env.ADMIN_USERNAME,
          password: 'wrongpassword'
        }
        await api
          .post(baseUrl)
          .send(credentials)
          .expect(401)
      })
    })

    describe('login with roles', () => {
      test('admin', async () => {
        const credentials = {
          username: env.ADMIN_USERNAME,
          password: env.ADMIN_PW
        }
        const response = await api
          .post(baseUrl)
          .send(credentials)
          .expect(200)
          .expect('Content-Type', /application\/json/)
        const { token } = response.body
        expect(token).toBeDefined()
      })
      test('user', async () => {
        const credentials = {
          username: env.USER_USERNAME,
          password: env.USER_PW
        }
        const response = await api
          .post(baseUrl)
          .send(credentials)
          .expect(200)
          .expect('Content-Type', /application\/json/)
        const { token } = response.body
        expect(token).toBeDefined()
      })
      test('disabled', async () => {
        const credentials = {
          username: env.DISABLED_USERNAME,
          password: env.DISABLED_PW
        }
        await api
          .post(baseUrl)
          .send(credentials)
          .expect(401)
      })
    })
  })
  afterAll(() => {
    server.close()
  })
})
