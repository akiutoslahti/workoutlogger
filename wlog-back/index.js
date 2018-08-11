const bodyParser = require('body-parser')
const db = require('./config/db')
const env = require('./config/env')
const express = require('express')
const morgan = require('morgan')
const router = require('./router/router')

const app = express()
app.use(morgan('dev'))
app.use(bodyParser.json())

router(app, db)

app.get('/', (request, response) => {
  response.send('wlog backend')
})

const port = env.PORT
const host = env.HOST

db.sequelize.sync({ force: true }).then(() => {
  app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
    console.log(`Access server at: http://${host}:${port}`)
  })
})
