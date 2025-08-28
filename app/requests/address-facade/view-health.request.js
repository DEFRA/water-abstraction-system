'use strict'

/**
 * View the health of the Address Facade
 * @module ViewHealthRequest
 */

const BaseRequest = require('../base.request.js')

const addressFacadeConfig = require('../../../config/address-facade.config.js')

/**
 * View the health of the Address Facade
 *
 * Normally, we would use the relevant service's base request object, for example, `address-facade.request.js`. However,
 * the Address facade for reasons only it knows (!!) returns a plain text response when you hit it's status endpoint.
 *
 * The rest of the time it returns JSON. We chose not to overcomplicate `address-facade.request.js` and try and handle
 * both just for this one request. So, instead we call `BaseRequest` directly.
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send() {
  const statusUrl = new URL('/address-service/hola', addressFacadeConfig.url)

  return BaseRequest.get(statusUrl.href, { responseType: 'text' })
}

module.exports = {
  send
}
