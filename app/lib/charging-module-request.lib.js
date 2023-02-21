'use strict'

/**
 * Use for making http requests to other services
 * @module ChargingModuleRequestLib
 */

const ChargingModuleTokenService = require('../services/charging-module/token.service.js')
const RequestLib = require('./request.lib.js')
const servicesConfig = require('../../config/services.config.js')

/**
 *
 * @param {string} route The route that you wish to connect to
 * @returns {Object} The result of the request; whether it succeeded and the response or error returned
 */
async function get (route) {
  const url = new URL(route, servicesConfig.chargingModule.url)
  const authentication = await ChargingModuleTokenService.go()
  const options = _getOptions(authentication)

  const result = await RequestLib.get(url.href, options)

  return _parseResult(result)
}

/**
 *
 * @param {string} route The route that you wish to connect to
 * @param {Object} additionalOptions Append to or replace the options passed to Got when making the request
 * @returns {Object} The result of the request; whether it succeeded and the response or error returned
 */
async function post (route, additionalOptions = {}) {
  const url = new URL(route, servicesConfig.chargingModule.url)
  const authentication = await ChargingModuleTokenService.go()
  const options = _postOptions(authentication, additionalOptions)

  const result = await RequestLib.post(url.href, options)

  return _parseResult(result)
}

function _getOptions (authentication) {
  return {
    headers: {
      authorization: `Bearer ${authentication.accessToken}`
    }
  }
}

function _postOptions (authentication, additionalOptions) {
  return {
    headers: {
      authorization: `Bearer ${authentication.accessToken}`
    },
    json: additionalOptions
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
