const supertest = require('supertest')
const { server, app } = require('../index')
const { initDatabase } = require('./initDatabase')
const api = supertest(app)

describe('users_api', () => {
  beforeAll(async () => {
    await initDatabase()
  })
  describe('GET /api/users', () => {
    // without authentication: not allowed
    test('without authentication', async () => {
      const response = await api.get('/api/users').expect(200)
      const response2 = await api.get('/api/users').expect(200)
    })
    // authenticated as user: not allowed
    // autheticated as admin: allowed
  })

  describe('GET /api/users/:id', () => {
    // without authentication: not allowed
    // authenticated as user: allowed only for self
    // autheticated as admin: allowed
  })

  describe('POST /api/users', () => {
    // without authentication: allowed with restriction of user role: user
    // authenticated as user: allowed with restriction of user role: user
    // autheticated as admin: allowed
  })

  describe('DELETE /api/users/:id', () => {
    // without authentication: not allowed
    // authenticated as user: allowed only for self
    // autheticated as admin: allowed
  })

  describe('PATCH /api/users/:id', () => {
    // without authentication: not allowed
    // authenticated as user: allowed only for self
    // autheticated as admin: allowed
  })
  afterAll(() => {
    server.close()
  })
})
