'use strict'

/**
 * Connects with the water-abstraction-service to delete a bill
 * @module DeleteBillRequest
 */

const LegacyRequest = require('../legacy.request.js')

/**
 * Send a request to the legacy water-abstraction-service to delete a bill
 *
 * Users can remove a bill from a bill run. This requires sending a request to the charging module, then after it has
 * regenerated the bill run refreshing the data on our side.
 *
 * Currently, this is all handled by the water-abstraction-service and we're not ready to migrate this until we have
 * migrated the refresh functionality (needed by a number of operations)
 *
 * So, as this is handled by the legacy service we need to send the request to it once a user confirms they wish to
 * remove the bill.
 *
 * @param {string} billRunId - UUID of the bill run the bill is being removed from
 * @param {string} billId - UUID of the bill to be removed
 * @param {module:UserModel} user - Instance representing the user that originated the request
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send (billRunId, billId, user) {
  const { id: userId } = user
  const path = `billing/batches/${billRunId}/invoices/${billId}`

  return LegacyRequest.delete('water', path, userId)
}

module.exports = {
  send
}
