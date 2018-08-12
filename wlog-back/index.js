const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')
const db = require('./config/db')
const env = require('./config/env')
const router = require('./router/router')
const http = require('http')

const app = express()
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(bodyParser.json())

router(app, db)

app.get('/', (request, response) => {
  response.send('wlog backend')
})

const server = http.createServer(app)
const port = env.PORT
const host = env.HOST

db.sequelize.sync({ force: env.DB_SYNC_FORCE || false }).then(() => {
  server.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
    console.log(`Access server at: http://${host}:${port}`)
  })
})

server.on('close', () => {
  db.sequelize.close()
})

module.exports = { app, server }
