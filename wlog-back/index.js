const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const env = require('./config/env')

const app = express()
app.use(morgan('dev'))
app.use(bodyParser.json())

app.get('*', (request, response) => {
  response.send('Hello world!')
})

const port = env.PORT
const host = env.HOST

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`)
  console.log(`Access server at: http://${host}:${port}`)
})
