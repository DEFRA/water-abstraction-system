'use strict'

/**
 * Use for making http requests to the EA Address facade https://github.com/DEFRA/ea-address-facade
 * @module AddressFacadeRequest
 */

const BaseRequest = require('./base.request.js')

const addressFacadeConfig = require('../../config/address-facade.config.js')
const requestConfig = require('../../config/request.config.js')

/**
 * Sends a GET request to the Address Facade
 *
 * @param {string} path - The path to send the request to (do not include the starting /)
 *
 * @returns {Promise<object>} An object representing the result of the request
 */
async function get(path) {
  const result = await _sendRequest(path, BaseRequest.get)

  return _parseResult(result)
}

/**
 * Sends a request to the Address Facade using the provided BaseRequest method
 *
 * @private
 */
async function _sendRequest(path, method) {
  const options = _requestOptions()

  const result = await method(path, options)

  return result
}

/**
 * Parses the address facade response returned from BaseRequest
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
      },
      matches: body?.results || []
    }
  }

  return result
}

/**
 * Additional options that will be added to the default options used by BaseRequest
 *
 * We use it to set
 *
 * - the base address faced URL for all requests
 * - the option to tell Got that we expect JSON responses. This means Got will automatically handle parsing the
 *   response to a JSON object for us
 *
 * @private
 */
function _requestOptions() {
  return {
    prefixUrl: addressFacadeConfig.url,
    responseType: 'json',
    timeout: {
      request: requestConfig.timeout
    }
  }
}

module.exports = {
  get
}
