'use strict'

/**
 * Use for making http requests to the GOV.UK Notify service https://www.notifications.service.gov.uk/
 * @module NotifyRequest
 */

const { HTTP_STATUS_TOO_MANY_REQUESTS } = require('node:http2').constants

const BaseRequest = require('./base.request.js')
const { pause } = require('../lib/general.lib.js')

const notifyConfig = require('../../config/notify.config.js')

/**
 * Sends a GET request to Notify
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
 * Sends a POST request to Notify
 *
 * @param {string} path - The path to send the request to (do not include the starting /)
 * @param {object} [body] - The body of the request
 *
 * @returns {Promise<object>} An object representing the result of the request
 */
async function post(path, body = {}) {
  let result = await _sendRequest(path, BaseRequest.post, body)

  // Only Notify POST requests are rated limited (assuming you are not DDoS them!) to 3,000 messages per minute,
  // calculated on a rolling basis. We should not hit this due to the other precautions we take, but if we do, we wait
  // by default 90 seconds to allow the limit to reset before retrying.
  if (result.response.statusCode === HTTP_STATUS_TOO_MANY_REQUESTS) {
    await pause(notifyConfig.rateLimitPause)
    result = await _sendRequest(path, BaseRequest.post, body)
  }

  return _parseResult(result)
}

/**
 * Sends a request to the Notify using the provided BaseRequest method
 *
 * @private
 */
async function _sendRequest(path, method, body) {
  const accessToken = await global.HapiServerMethods.getNotifyToken()
  const options = _requestOptions(accessToken, body)

  const result = await method(path, options)

  return result
}

/**
 * Parses the Notify response returned from BaseRequest
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
function _requestOptions(accessToken, body) {
  return {
    prefixUrl: notifyConfig.url,
    headers: {
      authorization: `Bearer ${accessToken}`
    },
    responseType: 'json',
    timeout: {
      request: notifyConfig.timeout
    },
    json: body
  }
}

module.exports = {
  get,
  post
}
