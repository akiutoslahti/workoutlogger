if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config() // eslint-disable-line global-require
}

const env = {}

env.PORT = process.env.PORT
env.HOST = process.env.HOST

env.DB_USER = process.env.DB_USER
env.DB_PW = process.env.DB_PW
env.DB_NAME = process.env.DB_NAME
env.DB_HOST = process.env.DB_HOST
env.DB_PORT = process.env.DB_PORT
env.DB_DIALECT = process.env.DB_DIALECT
env.DB_SYNC_FORCE = false

if (process.env.NODE_ENV === 'test') {
  env.DB_NAME = process.env.TEST_DB_NAME
  env.DB_SYNC_FORCE = true
}

env.JWT_SECRET = process.env.JWT_SECRET

module.exports = env
