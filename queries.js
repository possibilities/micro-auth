const password = require('./password')
const omit = require('lodash.omit')

const findUserForUsername = (database, username) =>
  database.find('users', { username })

const findUserForCredentials = async (database, credentials) => {
  const user = await findUserForUsername(database, credentials.username)
  if (user && await password.compare(credentials.password, user.password)) {
    return user
  }
}

const addUser = async (database, user) => {
  const encryptedPassword = await password.hash(user.password)

  const userWithEncryptedPassword = Object.assign(
    {},
    user,
    { password: encryptedPassword }
  )

  const savedUser = await database.save('users', userWithEncryptedPassword)

  return omit(savedUser, 'password')
}

module.exports = { findUserForUsername, findUserForCredentials, addUser }
