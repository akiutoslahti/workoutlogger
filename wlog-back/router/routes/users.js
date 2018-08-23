const bcrypt = require('bcrypt')
const validator = require('validator')

const baseUrl = '/api/users'
const saltrounds = 10

const formatUser = (user) => {
  const formattedUser = user.toJSON()
  delete formattedUser.passwordHash
  delete formattedUser.created_at
  delete formattedUser.updated_at
  return formattedUser
}

const usersRouter = (app, db) => {
  app.get(baseUrl, async (request, response) => {
    try {
      const { token } = request
      if (!token || token.role !== 'admin') {
        return response.status(401).json({
          error: `GET ${baseUrl} failed because of insufficient priviledges`
        })
      }
      const allUsers = await db.users.findAll()
      const formattedUsers = allUsers.map((user) => formatUser(user))
      return response.status(200).json(formattedUsers)
    } catch (error) {
      return response
        .status(500)
        .json({ error: `GET ${baseUrl} failed because of error` })
    }
  })

  app.get(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
      const { token } = request
      if (!token) {
        return response.status(401).json({
          error: `GET ${baseUrl}/${id} failed because of insufficient priviledges`
        })
      }
      if (!validator.isUUID(id, 4)) {
        return response.status(400).json({
          error: `GET ${baseUrl}/${id} failed because id is not valid`
        })
      }

      if (!(token.id === id || token.role === 'admin')) {
        return response.status(401).json({
          error: `GET ${baseUrl}/${id} failed because of insufficient priviledges`
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

      return response.status(200).json(formatUser(userById))
    } catch (error) {
      return response
        .status(500)
        .json({ error: `GET ${baseUrl}/${id} failed because of error` })
    }
  })

  app.post(baseUrl, async (request, response) => {
    try {
      const { name, role, username, password } = request.body

      if (!name || name.length === 0 || !username || username.length === 0) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because empty name and/or username is not allowed`
        })
      }

      if (!password || password.length === 0) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because empty password is not allowed`
        })
      }

      if (!(role === 'admin' || role === 'user')) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because only roles 'admin' are 'user' are allowed`
        })
      }

      const { token } = request

      if (role === 'admin' && (!token || token.role !== 'admin')) {
        return response.status(401).json({
          error: `POST ${baseUrl} failed because of insufficient priviledges`
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
      return response.status(201).json(formatUser(createdUser))
    } catch (error) {
      return response
        .status(500)
        .json({ error: `POST ${baseUrl} failed because of error` })
    }
  })

  app.delete(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
      const { token } = request
      if (!token) {
        return response.status(401).json({
          error: `DELETE ${baseUrl}/${id} failed because of insufficient priviledges`
        })
      }
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
      if (token.id !== userExists.id && token.role !== 'admin') {
        return response.status(401).json({
          error: `DELETE ${baseUrl}/${id} failed because of insufficient priviledges`
        })
      }

      await db.users.destroy({ where: { id } })
      return response.status(204).send()
    } catch (error) {
      return response
        .status(500)
        .json({ error: `DELETE ${baseUrl}/${id} failed because of error` })
    }
  })

  app.patch(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
      const { token } = request
      if (!token) {
        return response.status(401).json({
          error: `DELETE ${baseUrl}/${id} failed because of insufficient priviledges`
        })
      }
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

      if (token.id !== userExists.id && token.role !== 'admin') {
        return response.status(401).json({
          error: `PATCH ${baseUrl}/${id} failed because of insufficient priviledges`
        })
      }

      const { updates } = request.body
      if (!updates) {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because no updates were provided in request`
        })
      }

      if (updates.id) {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because id cannot be patched`
        })
      }

      if (updates.role === 'admin' && token.role != 'admin') {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because only admin can promote new admins`
        })
      }

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
      return response.status(200).json(formatUser(updatedUser))
    } catch (error) {
      return response
        .status(500)
        .json({ error: `PATCH ${baseUrl}/${id} failed because of error` })
    }
  })
}

module.exports = usersRouter
