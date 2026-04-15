'use strict'

/**
 * Make a http requests to Gotenberg to convert HTML into a PDF
 * @module GotenbergRequest
 */

const { HTTP_STATUS_OK } = require('node:http2').constants

const BaseRequest = require('./base.request.js')
const { pause } = require('../lib/general.lib.js')

const gotenbergConfig = require('../../config/gotenberg.config.js')

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

/**
 * When the request is set with a `responseType` of 'buffer', as of v15, **Got** returns a
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array|Uint8Array}
 * instead of a {@link https://nodejs.org/api/buffer.html|Node Buffer}.
 *
 * This broke previewing a PDF in the browser when it happened, we think because Hapi is expecting a Node buffer.
 *
 * So, to ensure the feature continues to work, we cast the body to a Node buffer.
 *
 * We then check if the request was successful or not. If it was, we return the 'body as buffer' as-is. The browser will
 * know to render this as a PDF. If it wasn't successful, we know Gotenberg returned an error message, which Got then
 * encoded as a Uint8Array. So we cast 'body as buffer' to a string.
 *
 * @private
 */
function _parseResult(result) {
  const { body, statusCode } = result.response

  if (body) {
    const bodyAsBuffer = Buffer.from(body)

    return {
      succeeded: result.succeeded,
      response: {
        statusCode,
        body: statusCode === HTTP_STATUS_OK ? bodyAsBuffer : bodyAsBuffer.toString()
      }
    }
  }

  return result
}

module.exports = {
  post
}
