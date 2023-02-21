'use strict'

/**
 * Use for making http requests to other services
 * @module ChargingModuleRequestLib
 */

const ChargingModuleTokenService = require('../services/charging-module/token.service.js')
const RequestLib = require('./request.lib.js')
const servicesConfig = require('../../config/services.config.js')

/**
 * Sends a GET request to the Charging Module for the provided route
 *
 * @param {string} route The route that you wish to connect to
 * @returns {Object} The result of the request; whether it succeeded and the response or error returned
 */
async function get (route) {
  const result = await _sendRequest(route, RequestLib.get)

  return _parseResult(result)
}

/**
 * Sends a POST request to the Charging Module for the provided route
 *
 * @param {string} route The route that you wish to connect to
 * @param {Object} body Body of the request which will be sent to the route as json
 * @returns {Object} The result of the request; whether it succeeded and the response or error returned
 */
async function post (route, body = {}) {
  const result = await _sendRequest(route, RequestLib.post, body)

  return _parseResult(result)
}

/**
 * Sends a request to the Charging Module to the provided using the provided RequestLib method
 *
 * @param {string} route
 * @param {Object} method An instance of a RequestLib method which will be used to send the request
 * @param {Object} [body] Optional body to be sent to the route as json
 * @returns
 */
async function _sendRequest (route, method, body = {}) {
  const url = new URL(route, servicesConfig.chargingModule.url)
  const authentication = await ChargingModuleTokenService.go()

  const result = await method(url.href, {
    headers: {
      ..._authorizationHeader(authentication.accessToken)
    },
    json: body
  })

  return result
}

function _authorizationHeader (accessToken) {
  return {
    authorization: `Bearer ${accessToken}`
  }
}

function _parseResult (result) {
  let response = result.response

  // If the request got a response from the Charging Module we will have a response body. If the request errored, for
  // example a timeout because the Charging Module is down, response will be the instance of the error thrown by Got.
  if (response.body) {
    response = JSON.parse(response.body)
  }

  return {
    succeeded: result.succeeded,
    response
  }
}

module.exports = {
  get,
  post
}
