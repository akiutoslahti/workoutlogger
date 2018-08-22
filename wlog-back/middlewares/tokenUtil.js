const jwt = require('jsonwebtoken')

const tokenUtil = (request, response, next) => {
  const authorization = request.get('Authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    const extractedToken = authorization.substring(7)
    const decodedToken = jwt.verify(extractedToken, process.env.JWT_SECRET)
    request.token = decodedToken
  }
  next()
}

module.exports = { tokenUtil }
