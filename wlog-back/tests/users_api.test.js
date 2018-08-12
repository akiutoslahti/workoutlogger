const supertest = require('supertest')
const { server } = require('../index')
const api = supertest(server)

describe('users_api', () => {
  test('GET all users', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(0)
  })
})

afterAll(() => {
  server.close()
})
