'use strict'

/**
 * Use for making http requests to the Charging Module
 * @module ChargingModuleRequest
 */

const BaseRequest = require('./base.request.js')

const requestConfig = require('../../config/request.config.js')
const servicesConfig = require('../../config/services.config.js')

/**
 * Sends a DELETE request to the Charging Module for the provided path
 *
 * > Note: This function has been called `deleteRequest` here rather than `delete` as `delete` is a reserved word.
 *
 * @param {string} path - The path to send the request to (do not include the starting /)
 *
 * @returns {Promise<object>} An object representing the result of the request
 */
async function deleteRequest (path) {
  const result = await _sendRequest(path, BaseRequest.delete)

  return _parseResult(result)
}

/**
 * Sends a GET request to the Charging Module for the provided route
 *
 * @param {string} path - The route to send the request to (do not include the starting /)
 *
 * @returns {Promise<object>} An object representing the result of the request
 */
async function get (path) {
  const result = await _sendRequest(path, BaseRequest.get)

  return _parseResult(result)
}

/**
 * Sends a PATCH request to the Charging Module for the provided path
 *
 * @param {string} path - The path to send the request to (do not include the starting /)
 *
 * @returns {Promise<object>} An object representing the result of the request
 */
async function patch (path) {
  const result = await _sendRequest(path, BaseRequest.patch)

  return _parseResult(result)
}

/**
 * Sends a POST request to the Charging Module for the provided path
 *
 * @param {string} path - The path to send the request to (do not include the starting /)
 * @param {object} [body] - The body of the request
 *
 * @returns {Promise<object>} An object representing the result of the request
 */
async function post (path, body = {}) {
  const result = await _sendRequest(path, BaseRequest.post, body)

  return _parseResult(result)
}

/**
 * Sends a request to the Charging Module using the provided BaseRequest method
 *
 * @private
 */
async function _sendRequest (path, method, body) {
  const authentication = await global.HapiServerMethods.getChargingModuleToken()
  const options = _requestOptions(authentication.accessToken, body)

  const result = await method(path, options)

  return result
}

/**
 * Additional options that will be added to the default options used by BaseRequest
 *
 * We use it to set
 *
 * - the base charging module URL for all requests
 * - the authorization header with the AWS Cognito token on our requests
 * - the body (which is always a JSON object) for our POST requests
 * - the option to tell Got that we expect JSON responses. This means Got will automatically handle parsing the
 *   response to a JSON object for us
 *
 * @private
 */
function _requestOptions (accessToken, body) {
  return {
    prefixUrl: servicesConfig.chargingModule.url,
    headers: {
      authorization: `Bearer ${accessToken}`
    },
    responseType: 'json',
    timeout: {
      request: requestConfig.chargingModuleTimeout
    },
    json: body
  }
}

/**
 * Parses the charging module response returned from BaseRequest
 *
 * @private
 */
function _parseResult (result) {
  const { body, headers, statusCode } = result.response

  if (body) {
    return {
      succeeded: result.succeeded,
      response: {
        info: {
          gitCommit: headers['x-cma-git-commit'],
          dockerTag: headers['x-cma-docker-tag']
        },
        statusCode,
        body
      }
    }
  }

  return result
}

module.exports = {
  delete: deleteRequest,
  get,
  patch,
  post
}
