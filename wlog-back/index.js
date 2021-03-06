const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')
const http = require('http')
const db = require('./config/db')
const env = require('./config/env')
const router = require('./router/router')
const { tokenUtil } = require('./middlewares/tokenUtil')

const app = express()
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(bodyParser.json())
app.use(tokenUtil)

router(app, db)

app.get('/', (request, response) => {
  response.send('wlog backend')
})

const server = http.createServer(app)
const port = env.PORT
const host = env.HOST

if (process.env.NODE_ENV !== 'test') {
  db.sequelize.sync({ force: env.DB_SYNC_FORCE || false }).then(() => {
    server.listen(port, () => {
      console.log(`Server listening on port: ${port}`)
      console.log(`Access server at: http://${host}:${port}`)
    })
  })
}

server.on('close', () => {
  db.sequelize.close()
})

module.exports = { app, server }
