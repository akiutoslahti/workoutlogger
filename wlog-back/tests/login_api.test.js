const supertest = require('supertest')
const { server, app } = require('../index')
const { initDatabase } = require('./initDatabase')
const api = supertest(app)
const env = require('../config/env')

const baseUrl = '/api/login'

describe('login_api', () => {
  beforeAll(async () => {
    await initDatabase()
  })
  describe('POST /api/login', () => {
    test('no username and/or password', async () => {
      await api
        .post(baseUrl)
        .send()
        .expect(400)
      await api
        .post(baseUrl)
        .send({ username: env.ADMIN_USERNAME })
        .expect(400)
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
    test('with role: admin', async () => {
      const credentials = {
        username: env.ADMIN_USERNAME,
        password: env.ADMIN_PW
      }
      const response = await api
        .post(baseUrl)
        .send(credentials)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const { token, username, name } = response.body
      expect(token).toBeDefined
      expect(username).toBe(env.ADMIN_USERNAME)
      expect(name).toBe(env.ADMIN_NAME)
    })
    test('with role: user', async () => {
      const credentials = {
        username: env.USER_USERNAME,
        password: env.USER_PW
      }
      const response = await api
        .post(baseUrl)
        .send(credentials)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const { token, username, name } = response.body
      expect(token).toBeDefined
      expect(username).toBe(env.USER_USERNAME)
      expect(name).toBe(env.USER_NAME)
    })
    test('with role: disabled', async () => {
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
  afterAll(() => {
    server.close()
  })
})
