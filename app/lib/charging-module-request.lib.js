'use strict'

/**
 * Use for making http requests to the Charging Module
 * @module ChargingModuleRequestLib
 */

const RequestLib = require('./request.lib.js')
const servicesConfig = require('../../config/services.config.js')

/**
 * Sends a GET request to the Charging Module for the provided route
 *
 * @param {string} route The route to send the request to
 *
 * @returns {Object} result An object representing the result of the request
 * @returns {boolean} result.succeeded Whether the request was successful
 * @returns {Object} result.response The Charging Module response if successful or the error response if not
 */
async function get (route) {
  const result = await _sendRequest(route, RequestLib.get)

  return _parseResult(result)
}

/**
 * Sends a POST request to the Charging Module for the provided route
 *
 * @param {string} route The route to send the request to
 * @param {Object} [body] The body of the request
 *
 * @returns {Object} result An object representing the result of the request
 * @returns {boolean} result.succeeded Whether the request was successful
 * @returns {Object} result.response The Charging Module response if successful or the error response if not.
 */
async function post (route, body = {}) {
  const result = await _sendRequest(route, RequestLib.post, body)

  return _parseResult(result)
}

/**
 * Sends a request to the Charging Module to the provided using the provided RequestLib method
 *
 * @param {string} route The route that you wish to connect to
 * @param {Object} method An instance of a RequestLib method which will be used to send the request
 * @param {Object} [body] Optional body to be sent to the route as json
 *
 * @returns {Object} The result of the request passed back from RequestLib
 */
async function _sendRequest (route, method, body) {
  const url = new URL(route, servicesConfig.chargingModule.url)
  const authentication = await global.HapiServerMethods.getChargingModuleToken()
  const options = _requestOptions(authentication.accessToken, body)

  const result = await method(url.href, options)

  return result
}

/**
 * Additional options that will be added to the default options used by RequestLib
 *
 * We use it to set the authorization header with the AWS Cognito token on our requests, the body (which is always
 * a JSON object) for our POST requests and the option to tell Got that we expect JSON responses. This means Got will
 * automatically handle parsing the response to a JSON object for us.
 *
 * @param {string} accessToken
 * @param {Object} body
 *
 * @returns Charging Module API specific options to be passed to RequestLib
 */
function _requestOptions (accessToken, body) {
  return {
    headers: {
      authorization: `Bearer ${accessToken}`
    },
    responseType: 'json',
    json: body
  }
}

/**
 * Parses the charging module response returned from RequestLib
 *
 * @param {Object} result The result object returned by RequestLib
 *
 * @returns {Object} If result was not an error, a parsed version of the response
 */
function _parseResult (result) {
  const { body, headers, statusCode } = result.response

  if (body) {
    return {
      succeeded: result.succeeded,
      response: {
        info: {
          gitCommit: headers['x-cma-git-commit'],
          dockerTag: headers['x-cma-docker-tag']
        },
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
