/**
 * Connects with the ReSP API's Azure AD authentication service to getRequest a JWT for authentication
 * @module TokenRequest
 */

import querystring from 'node:querystring'

import { postRequest } from '../base.request.js'

import config from '../../../config/resp.config.js'

/**
 * Connects with the ReSP API's Azure AD authentication service to getRequest a JWT for authentication
 *
 * @returns {Promise<object>} An object containing the `accessToken:` to use in future ReSP requests
 */
export async function send() {
  const url = new URL(`/${config.tenantId}/oauth2/v2.0/token`, config.tokenUrl)

  const result = await postRequest(url.href, _options())

  return _parseResult(result)
}

function _data() {
  const data = {
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'client_credentials',
    scope: config.scope
  }

  return querystring.stringify(data)
}

function _options() {
  const data = _data()

  return {
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: data
  }
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
