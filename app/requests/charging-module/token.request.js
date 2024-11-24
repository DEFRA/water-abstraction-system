'use strict'

/**
 * Connects with the Charging Module API's Cognito service to get a JWT for authentication
 * @module TokenRequest
 */

const BaseRequest = require('../base.request.js')

const servicesConfig = require('../../../config/services.config.js')

/**
 * Connects with the Charging Module API's Cognito service to get a JWT for authentication
 *
 * @returns {Promise<object>} An object containing the `accessToken:` to use in future Charging Module requests
 */
async function send() {
  const url = new URL('/oauth2/token', servicesConfig.chargingModule.token.url)

  const result = await BaseRequest.post(url.href, _options())

  return _parseResult(result)
}

function _options() {
  return {
    searchParams: {
      grant_type: 'client_credentials'
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      authorization: `Basic ${_encodeAuthorisation()}`
    }
  }
}

function _encodeAuthorisation() {
  const keys = Buffer.from(
    `${servicesConfig.chargingModule.token.username}:${servicesConfig.chargingModule.token.password}`
  )

  return keys.toString('base64')
}

function _parseResult(result) {
  const authentication = {
    accessToken: null,
    expiresIn: null
  }

  if (result.succeeded) {
    const data = JSON.parse(result.response.body)

    authentication.accessToken = data.access_token
    authentication.expiresIn = data.expires_in
  }

  return authentication
}

module.exports = {
  send
}
