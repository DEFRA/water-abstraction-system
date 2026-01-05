'use strict'

/**
 * Orchestrates validating the data for `/signin` page
 *
 * @module SubmitSigninService
 */

const bcrypt = require('bcryptjs')
const util = require('util')
const checkPassword = util.promisify(bcrypt.compare)

const SigninInternalUserRequest = require('../../requests/legacy/signin-internal-user.request.js')
const SigninPresenter = require('../../presenters/authentication/signin.presenter.js')
const SigninValidator = require('../../validators/authentication/signin.validator.js')
const UserModel = require('../../models/user.model.js')

const { formatValidationResult } = require('../../presenters/base.presenter.js')

const ACCOUNT_DISABLED_ERROR = {
  errorList: [
    { href: '#username', text: 'Account is disabled' }
  ],
  username: 'Account is disabled'
}

const LEGACY_SESSION_ERROR = {
  errorList: [
    { href: '#username', text: 'There was a problem creating your session in the legacy system' }
  ],
  username: 'There was a problem creating your session in the legacy system'
}

const USERNAME_PASSWORD_ERROR = {
  errorList: [
    { href: '#username', text: 'Check your email address' },
    { href: '#password', text: 'Check your password' }
  ],
  password: 'Check your password',
  username: 'Check your email address'
}

/**
 * Orchestrates validating the data for `/signin` page
 *
 * @param {object} payload - The submitted form data
 * @param {object} cookieAuth - The cookie auth object from the Hapi request object
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(payload, cookieAuth, h) {
  const pageData = SigninPresenter.go(payload)

  const validationResult = _validate(payload)
  if (validationResult) {
    return {
      error: validationResult,
      ...pageData
    }
  }

  const user = await UserModel.query().where('username', payload.username).where('application', 'water_admin').first()
  if (!user) {
    return {
      error: USERNAME_PASSWORD_ERROR,
      ...pageData
    }
  }

  if (!(await checkPassword(payload.password, user.password))) {
    return {
      error: USERNAME_PASSWORD_ERROR,
      ...pageData
    }
  }

  if (!user.enabled) {
    return {
      error: ACCOUNT_DISABLED_ERROR,
      ...pageData
    }
  }

  // Get a legacy cookie and set it in the response, so the user is also signed in to the legacy system
  const legacySigninResult = await SigninInternalUserRequest.send(payload.username, payload.password)
  if (!legacySigninResult.succeeded) {
    return {
      error: LEGACY_SESSION_ERROR,
      ...pageData
    }
  }

  const legacyCookieHeader = legacySigninResult.response.headers['set-cookie']
  const legacySessionCookie = legacyCookieHeader.find(cookie => cookie.startsWith('session='))
  const legacySessionCookieValue = legacySessionCookie.split('; ')[0].split('=')[1]

  h.state('session', legacySessionCookieValue, {
    encoding: 'none',
    isHttpOnly: true,
    isSameSite: 'Lax',
    isSecure: false,
    path: '/',
    ttl: 5 * 24 * 60 * 60 * 1000 // 5 days
  })

  cookieAuth.set({ userId: user.id })

  return { redirect: '/' }
}

async function _save(session, payload) {
  return session.$update()
}

function _validate(payload) {
  const validationResult = SigninValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
