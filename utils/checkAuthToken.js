const jwt_decode = require('jwt-decode')

const checkAuthentication = (request) => {
  try {
    decoded = jwt_decode(request.headers.authorization)
    return decoded.id
  } catch (e) {
    return null
  }
}

module.exports = checkAuthentication