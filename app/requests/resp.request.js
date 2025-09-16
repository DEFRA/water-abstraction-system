'use strict'

/**
 * Use for making http requests to the ReSP API
 * @module RespRequest
 */

const BaseRequest = require('./base.request.js')

const respConfig = require('../../config/resp.config.js')

/**
 * Sends a GET request to the ReSP API for the provided route
 *
 * @param {string} path - The route to send the request to (do not include the starting /)
 *
 * @returns {Promise<object>} An object representing the result of the request
 */
async function get(path) {
  const result = await _sendRequest(path, BaseRequest.get)

  return _parseResult(result)
}

/**
 * Sends a request to the ReSP API using the provided BaseRequest method
 *
 * @private
 */
async function _sendRequest(path, method) {
  const authentication = await global.HapiServerMethods.getRespToken()
  const options = _requestOptions(authentication.accessToken)

  const result = await method(path, options)

  return result
}

/**
 * Additional options that will be added to the default options used by BaseRequest
 *
 * We use it to set
 *
 * - the base ReSP API URL for all requests
 * - the authorization header with the Azure AD token on our requests
 * - the option to tell Got that we expect JSON responses. This means Got will automatically handle parsing the
 *   response to a JSON object for us
 *
 * @private
 */
function _requestOptions(accessToken) {
  return {
    prefixUrl: respConfig.url,
    headers: {
      authorization: `Bearer ${accessToken}`
    },
    responseType: 'json'
  }
}

/**
 * Parses the ReSP API response returned from BaseRequest
 *
 * @private
 */
function _parseResult(result) {
  const { body, statusCode } = result.response

  if (body) {
    return {
      succeeded: result.succeeded,
      response: {
        statusCode,
        body
      }
    }
  }

  return result
}

module.exports = {
  get
}
