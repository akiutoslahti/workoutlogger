require('dotenv').config()

const env = {}

env.PORT = process.env.PORT || 3000
env.HOST = process.env.HOST || 'localhost'

env.DB_USER = process.env.DB_USER
env.DB_PW = process.env.DB_PW
env.DB_NAME = process.env.DB_NAME
env.DB_HOST = process.env.DB_HOST
env.DB_PORT = process.env.DB_PORT
env.DB_DIALECT = process.env.DB_DIALECT

env.JWT_SECRET = process.env.JWT_SECRET

module.exports = env
