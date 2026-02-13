'use strict'

/**
 * Use for making http requests to the GOV.UK Companies House service https://api.companieshouse.gov.uk/
 * @module CompaniesHouseRequest
 */

const BaseRequest = require('./base.request.js')

const companiesHouseConfig = require('../../config/companies-house.config.js')

/**
 * Sends a GET request to Companies House
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
 * Sends a request to the Companies House using the provided BaseRequest method
 *
 * @private
 */
async function _sendRequest(path, method, body) {
  const accessToken = Buffer.from(companiesHouseConfig.apiKey).toString('base64')

  const options = _requestOptions(accessToken, body)

  const result = await method(path, options)

  return result
}

/**
 * Parses the Companies House response returned from BaseRequest
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
      matches: body?.items || []
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
    prefixUrl: companiesHouseConfig.url,
    headers: {
      authorization: `Basic ${accessToken}`
    },
    responseType: 'json',
    json: body
  }
}

module.exports = {
  get
}
