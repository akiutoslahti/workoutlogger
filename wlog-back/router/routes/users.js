const bcrypt = require('bcrypt')
const validator = require('validator')

const baseUrl = '/api/users'
const saltrounds = 10

const usersRouter = (app, db) => {
  app.get(baseUrl, async (request, response) => {
    try {
      const allUsers = await db.users.findAll()
      return response.status(200).json(allUsers)
    } catch (error) {
      return response
        .status(500)
        .json({ error: `GET ${baseUrl} failed due error` })
    }
  })

  app.get(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
      if (!validator.isUUID(id, 4)) {
        return response.status(400).json({
          error: `GET ${baseUrl}/${id} failed because id is not valid`
        })
      }

      const userById = await db.users.find({
        where: { id }
      })
      if (!userById) {
        return response.status(404).json({
          error: `GET ${baseUrl}/${id} failed because user does not exist`
        })
      }

      return response.status(200).json(userById)
    } catch (error) {
      return response
        .status(500)
        .json({ error: `GET ${baseUrl}/${id} failed due error` })
    }
  })

  app.post(baseUrl, async (request, response) => {
    try {
      const { name, role, username, password } = request.body

      if (!name || !username) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because empty name and/or username is not allowed`
        })
      }

      if (password.length === 0) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because empty password is not allowed`
        })
      }

      if (!(role === 'admin' || role === 'user' || role === 'disabled')) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because only roles 'admin', 'user' and 'disabled' are allowed`
        })
      }

      const userAllreadyExists = await db.users.find({
        where: { username }
      })
      if (userAllreadyExists) {
        return response.status(409).json({
          error: `POST ${baseUrl} failed because username is allready taken`
        })
      }

      const passwordHash = await bcrypt.hash(password, saltrounds)

      const newUser = {
        name,
        role,
        username,
        passwordHash
      }

      const createdUser = await db.users.create(newUser)
      return response.status(201).json(createdUser)
    } catch (error) {
      return response
        .status(500)
        .json({ error: `POST ${baseUrl} failed due error` })
    }
  })

  app.delete(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
      if (!validator.isUUID(id, 4)) {
        return response.status(400).json({
          error: `DELETE ${baseUrl}/${id} failed because id is not valid`
        })
      }

      const userExists = await db.users.find({ where: { id } })
      if (!userExists) {
        return response.status(404).json({
          error: `DELETE ${baseUrl}/${id} failed because user does not exist`
        })
      }

      db.users.destroy({ where: { id } })
      return response.status(200).send()
    } catch (error) {
      return response
        .status(500)
        .json({ error: `DELETE ${baseUrl}/${id} failed due error` })
    }
  })

  app.patch(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
      if (!validator.isUUID(id, 4)) {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because id is not valid`
        })
      }

      const userExists = await db.users.find({ where: { id } })
      if (!userExists) {
        return response.status(404).json({
          error: `PATCH ${baseUrl}/${id} failed because user does not exist`
        })
      }

      const { updates } = request.body
      if (updates.passwordHash) {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because passwordHash cannot be changed directly`
        })
      }

      if (updates.password) {
        const passwordHash = await bcrypt.hash(updates.password, saltrounds)
        delete updates.password
        updates.passwordHash = passwordHash
      }

      const updatedUser = await userExists.updateAttributes(updates)
      return response.status(200).json(updatedUser)
    } catch (error) {
      return response
        .status(500)
        .json({ error: `PATCH ${baseUrl}/${id} failed due error` })
    }
  })
}

module.exports = usersRouter
