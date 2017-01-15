const bcrypt = require('bcrypt')

const generateSalt = () =>
  new Promise((resolve, reject) => bcrypt.genSalt(10, (error, salt) => {
    if (error) {
      reject(error)
    } else {
      resolve(salt)
    }
  }))

const hash = password => {
  return new Promise(async (resolve, reject) => {
    const salt = await generateSalt()
    bcrypt.hash(password, salt, (error, hash) => {
      if (error) {
        reject(error)
      } else {
        resolve(hash)
      }
    })
  })
}

const compare = async (pass1, pass2) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(pass1, pass2, (error, isPasswordValid) => {
      if (error) {
        reject(error)
      } else {
        resolve(isPasswordValid)
      }
    })
  })
}

module.exports = { hash, compare }
