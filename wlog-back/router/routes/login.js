const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const env = require('../../config/env')

const baseUrl = '/api/login'

const loginRouter = (app, db) => {
  app.post(baseUrl, async (request, response) => {
    const { username, password } = request.body
    if (!username || !password) {
      return response
        .status(400)
        .json({ error: 'username and/or password not provided' })
    }

    const user = await db.users.find({ where: { username } })
    if (!user) {
      return response.status(404).json({ error: 'user does not exist' })
    }

    if (user.role === 'disabled') {
      return response
        .status(401)
        .json({ error: 'user account has been disabled' })
    }

    const passwordCorrect = await bcrypt.compare(password, user.passwordHash)
    if (!passwordCorrect) {
      return response.status(401).json({ error: 'invalid password' })
    }

    const userForToken = {
      id: user.id,
      username: user.username,
      role: user.role
    }

    const token = jwt.sign(userForToken, env.JWT_SECRET)

    return response.status(200).json({
      token,
      username: user.username,
      name: user.name,
      role: user.role
    })
  })
}

module.exports = loginRouter
