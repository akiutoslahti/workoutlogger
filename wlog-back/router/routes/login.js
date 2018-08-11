const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const env = require('../../config/env')

const baseUrl = '/api/login'

const loginRouter = (app, db) => {
  app.post(baseUrl, async (request, response) => {
    const { username, password } = request.body

    const user = await db.users.find({ where: { username } })
    const passwordCorrect =
      user === null ? false : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
      return response
        .status(401)
        .json({ error: 'invalid username and/or password' })
    }

    const userForToken = {
      username: user.username,
      id: user.id
    }

    const token = jwt.sign(userForToken, env.JWT_SECRET)

    return response
      .status(200)
      .json({ token, username: user.username, name: user.name })
  })
}

module.exports = loginRouter
