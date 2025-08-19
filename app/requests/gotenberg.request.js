'use strict'

/**
 * Make a http requests to Gotenberg to convert HTML into a PDF
 * @module GotenbergRequest
 */

const BaseRequest = require('./base.request.js')

const gotenbergConfig = require('../../config/gotenberg.config.js')
const requestConfig = require('../../config/request.config.js')

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

async function _sendRequest(path, method, formData) {
  const options = _requestOptions(formData)

  const result = await method(path, options)

  return result
}

function _requestOptions(formData) {
  return {
    prefixUrl: gotenbergConfig.url,
    responseType: 'buffer',
    timeout: {
      request: requestConfig.gotenbergTimeout
    },
    body: formData
  }
}

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
