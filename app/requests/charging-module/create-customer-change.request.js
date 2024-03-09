'use strict'

/**
 * Connects with the Charging Module to create a new customer change
 * @module CreateCustomerChangeRequest
 */

const ChargingModuleRequest = require('../charging-module.request.js')

/**
 * Sends a request to the Charging Module to create a new customer change and returns the result
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/customer/CreateCustomerChange | API docs} for more
 * details
 *
 * @param {Object} customerChangeData - The customer change details to be sent in the body of the request
 *
 * @returns {Promise<Object>} The result of the request; whether it succeeded and the response or error returned
 */
async function go (customerChangeData) {
  const result = await ChargingModuleRequest.post('v3/wrls/customer-changes', customerChangeData)

  return result
}

module.exports = {
  go
}
