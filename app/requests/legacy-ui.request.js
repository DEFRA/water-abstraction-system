'use strict'

/**
 * Use for making http requests to the legacy user interface web applications
 *
 * @module LegacyUiRequest
 */

const BaseRequest = require('./base.request.js')

const legacyConfig = require('../../config/legacy.config.js')

const applications = {
  // REPO-NAME - PM2 NAME
  // water-abstraction-ui - ui
  external: legacyConfig.externalUi.url,
  // water-abstraction-ui - internal-ui
  internal: legacyConfig.internalUi.url
}

/**
 * Sends a GET request to the legacy service for the provided path
 *
 * @param {string} applicationName - Name of the legacy application to call (external or internal)
 * @param {string} path - The path to send the request to (do not include the starting /)
 *
 * @returns {Promise<object>} An object representing the result of the request
 */
async function get(applicationName, path) {
  return _sendRequest(BaseRequest.get, applicationName, path)
}

/**
 * Sends a POST request to the legacy service for the provided path
 *
 * @param {string} applicationName - Name of the legacy application to call (external or internal)
 * @param {string} path - The path to send the request to (do not include the starting /)
 * @param {object} [body] - Data to be sent in the request body to the service as form elements
 *
 * @returns {Promise<object>} An object representing the result of the request
 */
async function post(applicationName, path, body = {}) {
  return _sendRequest(BaseRequest.post, applicationName, path, body)
}

function _application(applicationName) {
  const application = applications[applicationName.trim().toLowerCase()]

  if (!application) {
    throw new Error(`Request to unknown legacy application ${applicationName}`)
  }

  return application
}

/**
 * Sends a request to a legacy application using the provided BaseRequest method
 *
 * @private
 */
async function _sendRequest(method, applicationName, path, body) {
  const application = _application(applicationName)
  const options = _requestOptions(application, body)

  const result = await method(path, options)

  return _parseResult(result)
}

/**
 * Additional options that will be added to the default options used by BaseRequest
 *
 * We use it to set
 *
 * - the base URL for the request
 * - the body (which is always URL form-encoded) for our POST requests
 * - the option to tell Got that we expect text responses, so that it does not try to parse JSON
 * - the option to not follow redirects, os we get the actual response from the legacy service
 *
 * @private
 */
function _requestOptions(application, body) {
  return {
    prefixUrl: application,
    responseType: 'text',
    followRedirect: false,
    form: body
  }
}

/**
 * Parses the charging module response returned from BaseRequest
 *
 * @private
 */
function _parseResult(result) {
  const { body, headers, statusCode } = result.response

  if (body) {
    return {
      succeeded: result.succeeded,
      response: {
        headers,
        body,
        statusCode
      }
    }
  }

  return result
}

module.exports = {
  get,
  post
}
