const api = require('./api')
const micro = require('micro')
const microCors = require('micro-cors')

const cors = microCors()

const port = process.env.AUTHENTICATION_API_PORT || 3000

const app = micro(cors(api))
app.listen(port)

console.info(`listening on port ${port}...`)
