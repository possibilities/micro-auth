const omit = require('lodash.omit')
const jwt = require('jsonwebtoken')
const queries = require('./queries')
const memoryBackend = require('./backends/memory')

const {
  findUserForUsername,
  findUserForCredentials,
  addUser
} = queries

if (!process.env.AUTHENTICATION_SECRET_KEY) {
  console.error('AUTHENTICATION_SECRET_KEY environment variable is required')
  process.exit(1)
}

const database = memoryBackend()

const createToken = async user => {
  const userView = omit(user, 'password')
  return jwt.sign(userView, process.env.AUTHENTICATION_SECRET_KEY)
}

const isPasswordStrong = password => password.length >= 6 // TODO
const isUsernameValid = username => /^[A-Za-z0-9]+$/.test(username)

const userExists = async username =>
  !!(await findUserForUsername(database, username))

// POST /sign-up
const signUp = async ({ body: user }) => {
  if (!user.username) throw new Error('username is required')
  if (!isUsernameValid(user.username)) throw new Error('username is not valid')
  if (!user.password) throw new Error('password is required')
  if (!isPasswordStrong(user.password)) {
    throw new Error('password must be at least 6 characters')
  }
  if (await userExists(user.username)) {
    throw new Error(`an account already exists for '${user.username}'`)
  }

  const newUser = await addUser(database, user)
  const token = await createToken(newUser)

  return Object.assign({}, newUser, { token })
}

// POST /sign-in
const signIn = async ({ body: credentials }) => {
  if (!credentials.username) throw new Error('username is required')
  if (!credentials.password) throw new Error('password is required')

  const user = await findUserForCredentials(database, credentials)
  if (user) {
    const token = await createToken(user)
    return Object.assign({}, omit(user, 'password'), { token })
  }

  throw new Error(`error signing in '${credentials.username}'`)
}

// GET /check-username
const checkUsername = async ({ params: { username } }) => {
  const user = await findUserForUsername(database, username)
  return user !== null;
}

module.exports = {
  signUp,
  signIn,
  checkUsername
}
