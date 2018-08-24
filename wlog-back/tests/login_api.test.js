const supertest = require('supertest')
const { server, app } = require('../index')
const dbTools = require('./dbTools')

const api = supertest(app)
const env = require('../config/env')

const baseUrl = '/api/login'

describe('login_api', () => {
  beforeAll(async () => {
    await dbTools.initDatabase()
  })

  describe(`POST ${baseUrl}`, () => {
    test('should 400 w/o username or password', async () => {
      const badLogins = [{}, { username: '' }, { password: '' }]
      const promiseArray = badLogins.map((badLogin) => {
        return api
          .post(baseUrl)
          .send(badLogin)
          .then((response) => {
            expect(response.status).toBe(400)
          })
      })
      await Promise.all(promiseArray)
    })

    test('should 404 w/ non-existing user', async () => {
      const nonExisting = {
        username: 'nonexisting',
        password: 'wrongpassword'
      }
      await api
        .post(baseUrl)
        .send(nonExisting)
        .expect(404)
    })

    test('should 401 w/ wrong password', async () => {
      const wronPassword = {
        username: env.ADMIN_USERNAME,
        password: 'wrongpassword'
      }
      await api
        .post(baseUrl)
        .send(wronPassword)
        .expect(401)
    })

    test('should 200 with admin login', async () => {
      const adminLogin = {
        username: env.ADMIN_USERNAME,
        password: env.ADMIN_PW
      }
      const response = await api
        .post(baseUrl)
        .send(adminLogin)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      let responseKeys = Object.keys(response.body)
      expect(responseKeys.includes('token')).toBe(true)
    })

    test('should 200 with user login', async () => {
      const credentials = {
        username: env.USER_USERNAME,
        password: env.USER_PW
      }
      const response = await api
        .post(baseUrl)
        .send(credentials)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      let responseKeys = Object.keys(response.body)
      expect(responseKeys.includes('token')).toBe(true)
    })

    test('should 401 with disabled login', async () => {
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
