'use strict'

/**
 * Use for making http requests to the legacy web services
 * @module LegacyRequest
 */

const BaseRequest = require('./base.request.js')

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
 * Sends a DELETE request to the legacy service for the provided path
 *
 * @param {string} serviceName - Name of the legacy service to call (background, crm, external, idm, import, internal,
 * permits, reporting, returns or water)
 * @param {string} path - The path to send the request to (do not include the starting /)
 * @param {string} [userId] - If the legacy endpoint needs to check a user's authorisation their ID to be added as a
 * header. Defaults to null
 * @param {boolean} [apiRequest] - Whether the request is to the service's API endpoints (JSON response) or web (HTML
 * response). Defaults to true
 *
 * @returns {Promise<object>} An object representing the result of the request
 */
async function deleteRequest(serviceName, path, userId = null, apiRequest = true) {
  return _sendRequest(BaseRequest.delete, serviceName, path, userId, apiRequest)
}

/**
 * Sends a GET request to the legacy service for the provided path
 *
 * @param {string} serviceName - Name of the legacy service to call (background, crm, external, idm, import, internal,
 * permits, reporting, returns or water)
 * @param {string} path - The path to send the request to (do not include the starting /)
 * @param {string} [userId] - If the legacy endpoint needs to check a user's authorisation their ID to be added as a
 * header. Defaults to null
 * @param {boolean} [apiRequest] - Whether the request is to the service's API endpoints (JSON response) or web (HTML
 * response). Defaults to true
 *
 * @returns {Promise<object>} An object representing the result of the request
 */
async function get(serviceName, path, userId = null, apiRequest = true) {
  return _sendRequest(BaseRequest.get, serviceName, path, userId, apiRequest)
}

/**
 * Sends a POST request to the legacy service for the provided path
 *
 * @param {string} serviceName - name of the legacy service to call (background, crm, external, idm, import, internal,
 * permits, reporting, returns or water)
 * @param {string} path - The path to send the request to (do not include the starting /)
 * @param {string} [userId] - If the legacy endpoint needs to check a user's authorisation their ID to be added as a
 * header. Defaults to null
 * @param {boolean} [apiRequest] - Whether the request is to the service's API endpoints (JSON response) or web (HTML
 * response). Defaults to true
 * @param {object} [body] - Data to be sent in the request body to the service as JSON
 *
 * @returns {Promise<object>} An object representing the result of the request
 */
async function post(serviceName, path, userId = null, apiRequest = true, body = {}) {
  return _sendRequest(BaseRequest.post, serviceName, path, userId, apiRequest, body)
}

/**
 * Sends a request to a legacy service using the provided BaseRequest method
 *
 * @private
 */
async function _sendRequest(method, serviceName, path, userId, apiRequest, body) {
  const service = _service(serviceName)
  const options = _requestOptions(service, userId, apiRequest, body)

  const result = await method(path, options)

  return _parseResult(result)
}

function _service(serviceName) {
  const service = services[serviceName.trim().toLowerCase()]

  if (!service) {
    throw new Error(`Request to unknown legacy service ${serviceName}`)
  }

  return service
}

/**
 * Additional options that will be added to the default options used by BaseRequest
 *
 * We use it to set
 *
 * - the base URL for the request
 * - the authorization header with shared legacy JWT Auth token
 * - the body (which is always a JSON object) for our POST requests
 * - the option to tell Got that we expect JSON responses. This means Got will automatically handle parsing the
 *   response to a JSON object for us
 *
 * @private
 */
function _requestOptions(service, userId, apiRequest, body) {
  const prefixUrl = apiRequest ? new URL(service.api, service.base).href : service.base

  const headers = {
    authorization: `Bearer ${servicesConfig.legacyAuthToken}`
  }

  // NOTE: Just like in our project and water-abstraction-ui some of the internal legacy services also have an
  // authorization strategy that applies scope to their routes. We authenticate with them using the shared JWT token the
  // previous team left behind. But that is not enough for those routes which have, for example, 'billing' configured as
  // their authorization scope.
  //
  // They expect the legacy UI to also let them know who the user is behind the request being made so they can confirm
  // they have authorization to do that 'thing'. As this has already been checked by the UI it is pointless and
  // wasteful. But it is what it is!
  //
  // water-abstraction-service for example appears to have a couple of strategies; decoding the user email from the JWT
  // token being one of them. But we suspect this was abandoned in favour of adding the user's userId as a header in the
  // request.
  if (userId) {
    headers['defra-internal-user-id'] = userId
  }

  return {
    prefixUrl,
    headers,
    responseType: 'json',
    json: body
  }
}

/**
 * Parses the charging module response returned from BaseRequest
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
      }
    }
  }

  return result
}

module.exports = {
  delete: deleteRequest,
  get,
  post
}
