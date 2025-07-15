'use strict'

/**
 * Make a http requests to Gotenberg to convert HTML into a PDF
 * @module GotenbergRequest
 */

const BaseRequest = require('./base.request.js')
const requestConfig = require('../../config/request.config.js')
const servicesConfig = require('../../config/services.config.js')

/**
 * Make a http requests to Gotenberg to convert HTML into a PDF
 *
 * @param {string} path - The path to send the request to (do not include the starting /)
 * @param {object} formData - The formData of the request
 *
 * @returns {Promise<object>} An object representing the result of the request
 */
async function post(path, formData) {
  const result = await _sendRequest(path, BaseRequest.post, formData)

  return _parseResult(result)
}

/**
 * Sends a request to the Charging Module using the provided BaseRequest method
 *
 * @private
 */
async function _sendRequest(path, method, formData) {
  const options = _requestOptions(formData)

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
function _requestOptions(formData) {
  return {
    headers: formData.getHeaders(),
    prefixUrl: servicesConfig.gotenberg.url,
    responseType: 'buffer',
    timeout: {
      request: requestConfig.gotenbergTimeout
    },
    body: formData
  }
}

/**
 * Parses the charging module response returned from BaseRequest
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
  post
}
