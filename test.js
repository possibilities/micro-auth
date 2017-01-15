import 'async-to-gen/register'
import 'babel-polyfill'

import test from 'ava'
import listen from 'test-listen'
import jwt from 'jsonwebtoken'

import microAuth from './index'
import micro from 'micro'
import request from 'request-promise'

const decodeToken = token =>
  jwt.verify(token, process.env.AUTHENTICATION_SECRET_KEY)

const testRequestOptions = {
  json: true,
  // Otherwise request-promise just gives the body
  resolveWithFullResponse: true,
  // Don't reject messages that come back with error code (e.g. 404, 500s)
  simple: false
}

test('signs up a new user', async t => {
  const router = micro(microAuth)
  const apiUrl = await listen(router)

  const signUpEndpoint = `${apiUrl}/sign-up`
  const signUpResponse = await request.post({
    body: {
      username: 'mikebannister',
      password: 'password'
    },
    url: signUpEndpoint,
    ...testRequestOptions
  })

  const { id, username, token } = signUpResponse.body
  const { username: usernameInToken } = decodeToken(token)

  t.truthy(id)
  t.deepEqual(username, 'mikebannister')
  t.deepEqual(signUpResponse.statusCode, 200)
  t.deepEqual(usernameInToken, 'mikebannister')
})

test('fails to sign up an existing user', async t => {
  const router = micro(microAuth)
  const apiUrl = await listen(router)

  const signUpEndpoint = `${apiUrl}/sign-up`
  const firstSignUpResponse = await request.post({
    body: {
      username: 'mikebannister',
      password: 'password'
    },
    url: signUpEndpoint,
    ...testRequestOptions
  })

  t.deepEqual(firstSignUpResponse.statusCode, 200)

  const secondSignUpResponse = await request.post({
    body: {
      username: 'mikebannister',
      password: 'password'
    },
    url: signUpEndpoint,
    ...testRequestOptions
  })

  t.deepEqual(secondSignUpResponse.statusCode, 500)
  t.deepEqual(
    secondSignUpResponse.body.message,
    `an account already exists for 'mikebannister'`
  )
})

test('signs in with correct credentials', async t => {
  const router = micro(microAuth)
  const apiUrl = await listen(router)

  // Sign up
  const signUpEndpoint = `${apiUrl}/sign-up`
  const signUpResponse = await request.post({
    body: {
      username: 'mikebannister',
      password: 'password'
    },
    url: signUpEndpoint,
    ...testRequestOptions
  })

  // Sign up succeeds
  t.deepEqual(signUpResponse.statusCode, 200)

  // Then try to sign in
  const signInEndpoint = `${apiUrl}/sign-in`
  const signInResponse = await request.post({
    body: {
      username: 'mikebannister',
      password: 'password'
    },
    url: signInEndpoint,
    ...testRequestOptions
  })

  const { id, username, token } = signInResponse.body
  const { username: usernameInToken } = decodeToken(token)

  t.truthy(id)
  t.deepEqual(username, 'mikebannister')
  t.deepEqual(signInResponse.statusCode, 200)
  t.deepEqual(usernameInToken, 'mikebannister')
})

test('fails to sign in with incorrect credentials', async t => {
  const router = micro(microAuth)
  const apiUrl = await listen(router)

  // Sign up
  const signUpEndpoint = `${apiUrl}/sign-up`
  const signUpResponse = await request.post({
    body: {
      username: 'mikebannister',
      password: 'password'
    },
    url: signUpEndpoint,
    ...testRequestOptions
  })

  // Sign up succeeds
  t.deepEqual(signUpResponse.statusCode, 200)

  // Then try to sign in
  const signInEndpoint = `${apiUrl}/sign-in`
  const signInResponse = await request.post({
    body: {
      username: 'mikebannister',
      password: 'wrongpassword'
    },
    url: signInEndpoint,
    ...testRequestOptions
  })

  // Sign in fails
  t.deepEqual(signInResponse.statusCode, 500)
  t.deepEqual(
    signInResponse.body.message,
    `error signing in 'mikebannister'`
  )
})

test('checks username that exists', async t => {
  const router = micro(microAuth)
  const apiUrl = await listen(router)

  const signUpEndpoint = `${apiUrl}/sign-up`
  const signUpResponse = await request.post({
    body: {
      username: 'mikebannister',
      password: 'password'
    },
    url: signUpEndpoint,
    ...testRequestOptions
  })

  // Sign up succeeds
  t.deepEqual(signUpResponse.statusCode, 200)

  const checkUsernameEndpoint = `${apiUrl}/check-username/mikebannister`
  const checkUsernameResponse = await request.get({
    url: checkUsernameEndpoint,
    ...testRequestOptions
  })

  const { username } = checkUsernameResponse.body

  t.deepEqual(checkUsernameResponse.statusCode, 200)
  t.deepEqual(username, 'mikebannister')
})

test('checks username that does not exists', async t => {
  const router = micro(microAuth)
  const apiUrl = await listen(router)

  const checkUsernameEndpoint = `${apiUrl}/check-username/mikebannister`
  const checkUsernameResponse = await request.get({
    url: checkUsernameEndpoint,
    ...testRequestOptions
  })

  t.deepEqual(checkUsernameResponse.statusCode, 404)
})

test('fails to sign up without a username', async t => {
  const router = micro(microAuth)
  const apiUrl = await listen(router)

  const signUpEndpoint = `${apiUrl}/sign-up`
  const signUpResponse = await request.post({
    url: signUpEndpoint,
    body: { password: 'password' },
    ...testRequestOptions
  })

  t.deepEqual(signUpResponse.statusCode, 500)
  t.deepEqual(
    signUpResponse.body.message,
    'username is required'
  )
})

test('fails to sign up without valid username', async t => {
  const router = micro(microAuth)
  const apiUrl = await listen(router)

  const signUpEndpoint = `${apiUrl}/sign-up`
  const signUpResponse = await request.post({
    url: signUpEndpoint,
    body: { username: 'mike@moof', password: 'password' },
    ...testRequestOptions
  })

  t.deepEqual(signUpResponse.statusCode, 500)
  t.deepEqual(
    signUpResponse.body.message,
    'username is not valid'
  )
})

test('fails to sign up with weak password', async t => {
  const router = micro(microAuth)
  const apiUrl = await listen(router)

  const signUpEndpoint = `${apiUrl}/sign-up`
  const signUpResponse = await request.post({
    url: signUpEndpoint,
    body: { username: 'mikebannister', password: 'pass' },
    ...testRequestOptions
  })

  t.deepEqual(signUpResponse.statusCode, 500)
  t.deepEqual(
    signUpResponse.body.message,
    'password must be at least 6 characters'
  )
})

test('fails to sign up without a password', async t => {
  const router = micro(microAuth)
  const apiUrl = await listen(router)

  const signUpEndpoint = `${apiUrl}/sign-up`
  const signUpResponse = await request.post({
    url: signUpEndpoint,
    body: { username: 'mikebannister' },
    ...testRequestOptions
  })

  t.deepEqual(signUpResponse.statusCode, 500)
  t.deepEqual(
    signUpResponse.body.message,
    'password is required'
  )
})

test('fails to sign in without a username', async t => {
  const router = micro(microAuth)
  const apiUrl = await listen(router)

  const signUpEndpoint = `${apiUrl}/sign-in`
  const signUpResponse = await request.post({
    url: signUpEndpoint,
    body: { password: 'password' },
    ...testRequestOptions
  })

  t.deepEqual(signUpResponse.statusCode, 500)
  t.deepEqual(
    signUpResponse.body.message,
    'username is required'
  )
})

test('fails to sign in without a password', async t => {
  const router = micro(microAuth)
  const apiUrl = await listen(router)

  const signUpEndpoint = `${apiUrl}/sign-in`
  const signUpResponse = await request.post({
    url: signUpEndpoint,
    body: { username: 'mikebannister' },
    ...testRequestOptions
  })

  t.deepEqual(signUpResponse.statusCode, 500)
  t.deepEqual(
    signUpResponse.body.message,
    'password is required'
  )
})
