const express = require('express')

const app = express()

app.get('*', (request, response) => {
  response.send('Hello world!')
})

const port = 3000
const host = 'localhost'
app.listen(port, () => {
  console.log(`Server listening on port: ${port}`)
  console.log(`Access server at: http://${host}:${port}`)
})
