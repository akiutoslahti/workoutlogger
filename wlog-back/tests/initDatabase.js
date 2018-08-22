const bcrypt = require('bcrypt')
const db = require('../config/db')
const env = require('../config/env')

const initDatabase = async () => {
  await db.sequelize.sync({ force: true })

  const saltRounds = 10

  const newAdmin = {
    name: env.ADMIN_NAME,
    username: env.ADMIN_USERNAME,
    role: 'admin',
    passwordHash: await bcrypt.hash(env.ADMIN_PW, saltRounds)
  }
  await db.users.create(newAdmin)

  const newUser = {
    name: env.USER_NAME,
    username: env.USER_USERNAME,
    role: 'user',
    passwordHash: await bcrypt.hash(env.USER_PW, saltRounds)
  }
  await db.users.create(newUser)

  const newDisabledUser = {
    name: env.DISABLED_NAME,
    username: env.DISABLED_USERNAME,
    role: 'disabled',
    passwordHash: await bcrypt.hash(env.DISABLED_PW, saltRounds)
  }
  await db.users.create(newDisabledUser)
}

module.exports = { initDatabase }
