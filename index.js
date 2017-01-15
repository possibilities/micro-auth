const microApi = require('micro-api')
const microCors = require('micro-cors')

const {
  signUp,
  signIn,
  checkUsername
} = require('./handlers')

const api = microApi([
  {
    method: 'post',
    path: '/sign-up',
    handler: signUp
  },
  {
    method: 'post',
    path: '/sign-in',
    handler: signIn
  },
  {
    method: 'GET',
    path: '/check-username/:username',
    handler: checkUsername
  }
])

const cors = microCors()
module.exports = cors(api)
