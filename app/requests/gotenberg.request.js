'use strict'

/**
 * Make a http requests to Gotenberg to convert HTML into a PDF
 * @module GotenbergRequest
 */

const BaseRequest = require('./base.request.js')
const { pause } = require('../lib/general.lib.js')

const gotenbergConfig = require('../../config/gotenberg.config.js')

/**
 * Sends a GET request to Gotenberg
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
 * Make a http requests to Gotenberg to convert HTML into a PDF
 *
 * @param {string} path - The path to send the request to (do not include the starting /)
 * @param {object} formData - The formData of the request
 *
 * @returns {Promise<object>} An object representing the result of the request
 */
async function post(path, formData) {
  const result = await _sendRequest(path, BaseRequest.post, formData)

  // Requests for PDFs are sporadic at best. We are talking weeks between users creating them. So, we haven't wasted
  // money or energy keeping Gotenberg running in an ECS instance with lots of resource.
  // Because of this we have found it benefits from a brief pause between requests, which we default to 2 secs.
  await pause(gotenbergConfig.delay)

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
      request: gotenbergConfig.timeout
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
  get,
  post
}
