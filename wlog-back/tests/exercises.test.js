const supertest = require('supertest')
const { server, app } = require('../index')
const dbTools = require('./dbTools')
const db = require('../config/db')

const api = supertest(app)
const env = require('../config/env')

const baseUrl = '/api/exercises'

let adminAuth
let userAuth
let adminId
let userId

const newExerciseWithName = (name) => ({})

describe('exercises_api', () => {
  beforeAll(async () => {
    await dbTools.initDatabase()
    await dbTools.adminLogin(api)
    await dbTools.userLogin(api)
    ;({ adminAuth, userAuth } = dbTools)
    const admin = await db.users.find({
      where: { username: env.ADMIN_USERNAME }
    })
    adminId = admin.id
    const user = await db.users.find({
      where: { username: env.USER_USERNAME }
    })
    userId = user.id
  })
  describe(`GET ${baseUrl}`, () => {})
  describe(`GET ${baseUrl}/:id`, () => {})

  describe(`POST ${baseUrl}`, () => {})

  describe(`DELETE ${baseUrl}/:id`, () => {})

  describe(`PATCH ${baseUrl}/:id`, () => {})

  afterAll(() => {
    server.close()
  })
})
