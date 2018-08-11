require('dotenv').config()

const env = {}

env.PORT = process.env.PORT || 3000
env.HOST = process.env.HOST || 'localhost'

module.exports = env
