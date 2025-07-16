'use strict'

/**
 * Controller for /check endpoints
 * @module CheckController
 */

const GenerateNotifyAddressService = require('../services/check/address/generate-notify-address.service.js')
const ValidateAddressService = require('../services/check/address/validate-address.service.js')

const SUCCESS_STATUS_CODE = 200
const NO_CONTENT_STATUS_CODE = 204

async function generateAddress(request, h) {
  const { licenceRef } = request.payload

  const result = await GenerateNotifyAddressService.go(licenceRef)

  return h.response(result).code(SUCCESS_STATUS_CODE)
}

/**
 * A test end point for checking functionality
 *
 * > This placeholder serves as a reference for when adding your check endpoint
 *
 * @param request - the hapi request object
 * @param h - the hapi response object
 *
 * @returns {Promise<object>} - A promise that resolves to an HTTP response object with a 204 status code
 */
async function placeholder(request, h) {
  const { id } = request.payload

  global.GlobalNotifier.omg('Placeholder endpoint called', { id })

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

async function validateAddress(request, h) {
  const result = await ValidateAddressService.go(request.payload)

  return h.response(result).code(SUCCESS_STATUS_CODE)
}

module.exports = {
  generateAddress,
  placeholder,
  validateAddress
}
