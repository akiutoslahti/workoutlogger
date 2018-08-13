const supertest = require('supertest')
const { server } = require('../index')

const api = supertest(server)

describe('users_api', () => {
  describe('GET /api/users', () => {
    // without authentication: not allowed
    test('without authentication', async () => {
      await api.get('/api/users').expect(401)
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
})

afterAll(() => {
  server.close()
})
