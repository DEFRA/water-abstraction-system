'use strict'

/**
 * Use for making http requests to the legacy web services
 * @module LegacyRequestLib
 */

const RequestLib = require('./request.lib.js')

const servicesConfig = require('../../config/services.config.js')

const services = {
  // REPO-NAME - PM2 NAME
  // water-abstraction-service - service-background
  background: {
    base: servicesConfig.serviceBackground.url,
    api: 'water/1.0'
  },
  // water-abstraction-tactical-crm - tactical-crm
  crm: {
    base: servicesConfig.tacticalCrm.url,
    api: 'crm/1.0'
  },
  // water-abstraction-ui - ui
  external: {
    base: servicesConfig.externalUi.url,
    api: ''
  },
  // water-abstraction-tactical-idm - tactical-idm
  idm: {
    base: servicesConfig.tacticalIdm.url,
    api: 'idm/1.0'
  },
  // water-abstraction-import - import
  import: {
    base: servicesConfig.import.url,
    api: 'import/1.0'
  },
  // water-abstraction-ui - internal-ui
  internal: {
    base: servicesConfig.internalUi.url,
    api: ''
  },
  // water-abstraction-permit-repository - permit-repository
  permits: {
    base: servicesConfig.permitRepository.url,
    api: 'API/1.0/'
  },
  // water-abstraction-reporting - reporting
  reporting: {
    base: servicesConfig.reporting.url,
    api: 'reporting/1.0'
  },
  // water-abstraction-returns - returns
  returns: {
    base: servicesConfig.returns.url,
    api: 'returns/1.0'
  },
  // water-abstraction-service - water-api
  water: {
    base: servicesConfig.serviceForeground.url,
    api: 'water/1.0'
  }
}

/**
 * Sends a GET request to the legacy service for the provided path
 *
 * @param {string} serviceName name of the legacy service to call (background, crm, external, idm, import, internal,
 * permits, reporting, returns or water)
 * @param {string} path The path to send the request to (do not include the starting /)
 * @param {boolean} apiRequest whether the request is to the service's API endpoints
 *
 * @returns {Object} result An object representing the result of the request
 * @returns {boolean} result.succeeded Whether the request was successful
 * @returns {Object} result.response The legacy service's response if successful or the error response if not.
 */
async function get (serviceName, path, apiRequest = true) {
  return await _sendRequest(RequestLib.get, serviceName, path, apiRequest)
}

/**
 * Sends a POST request to the legacy service for the provided path
 *
 * @param {string} serviceName name of the legacy service to call (background, crm, external, idm, import, internal,
 * permits, reporting, returns or water)
 * @param {string} path the path to send the request to (do not include the starting /)
 * @param {boolean} apiRequest whether the request is to the service's API endpoints
 * @param {Object} [body] optional body to be sent to the service as json
 *
 * @returns {Object} result An object representing the result of the request
 * @returns {boolean} result.succeeded Whether the request was successful
 * @returns {Object} result.response The legacy service's response if successful or the error response if not.
 */
async function post (serviceName, path, apiRequest = true, body = {}) {
  return await _sendRequest(RequestLib.post, serviceName, path, apiRequest, body)
}

/**
 * Sends a request to a legacy service using the provided RequestLib method
 *
 * @param {Object} method an instance of a RequestLib method which will be used to send the request
 * @param {string} serviceName name of the legacy service (see `services`)
 * @param {string} path the path that you wish to connect to (do not include the starting /)
 * @param {boolean} apiRequest whether the request is to the service's API endpoints
 * @param {Object} body body to be sent to the service as json
 *
 * @returns {Object} The result of the request passed back from RequestLib
 */
async function _sendRequest (method, serviceName, path, apiRequest, body) {
  const service = _service(serviceName)
  const options = _requestOptions(service, apiRequest, body)

  const result = await method(path, options)

  return _parseResult(result)
}

function _service (serviceName) {
  const service = services[serviceName.trim().toLowerCase()]

  if (!service) {
    throw new Error(`Request to unknown legacy service ${serviceName}`)
  }

  return service
}

/**
 * Additional options that will be added to the default options used by RequestLib
 *
 * We use it to set
 *
 * - the base URL for the request
 * - the authorization header with shared legacy JWT Auth token
 * - the body (which is always a JSON object) for our POST requests
 * - the option to tell Got that we expect JSON responses. This means Got will automatically handle parsing the
 *   response to a JSON object for us
 *
 * @param {Object} service which legacy service we are connecting with
 * @param {boolean} apiRequest whether the request is to the service's API endpoints
 * @param {Object} body the request body if applicable
 *
 * @returns Legacy specific options to be passed to RequestLib
 */
function _requestOptions (service, apiRequest, body) {
  const prefixUrl = apiRequest ? new URL(service.api, service.base).href : service.base

  return {
    prefixUrl,
    headers: {
      authorization: `Bearer ${servicesConfig.legacyAuthToken}`
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
