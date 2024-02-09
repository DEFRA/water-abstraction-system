'use strict'

/**
 * Connects with the Charging Module to create a new customer change
 * @module ChargingModuleCreateCustomerChangeService
 */

const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')

/**
 * Sends a request to the Charging Module to create a new customer change and returns the result
 *
 * {@link https://defra.github.io/sroc-charging-module-api-docs/#/customer/CreateCustomerChange | API docs}
 *
 * @param {Object} requestData The data that will be sent in the POST request
 *
 * @returns {Promise<Object>} result An object representing the result of the request
 * @returns {boolean} result.succeeded Whether the customer change request was successful
 * @returns {Object} result.response Just a 201 status code if successful; or the error response if not
 */
async function go (requestData) {
  const result = await ChargingModuleRequestLib.post('v3/wrls/customer-changes', requestData)

  return result
}

module.exports = {
  go
}
