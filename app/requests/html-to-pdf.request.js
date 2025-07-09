'use strict'

/**
 * Use for making http requests to the HTML to PDF converter
 * @module HTMLToPDFRequest
 */

const BaseRequest = require('./base.request.js')

const requestConfig = require('../../config/request.config.js')
const servicesConfig = require('../../config/services.config.js')

/**
 * Sends a POST request to the Charging Module for the provided path
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
    prefixUrl: servicesConfig.htmlToPdf.url,
    responseType: 'buffer',
    timeout: {
      request: requestConfig.htmlToPdfTimeout
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
  return result.response.body
}

module.exports = {
  post
}
