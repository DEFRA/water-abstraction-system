'use strict'

/**
 * Connects with the water-abstraction-service to delete a bill licence
 * @module DeleteBillLicenceRequest
 */

const LegacyRequest = require('../legacy.request.js')

/**
 * Send a request to the legacy water-abstraction-service to delete a bill licence
 *
 * Users can remove a licence from a bill run. This requires sending a request to the charging module, then after it has
 * regenerated the bill run refreshing the data on our side.
 *
 * Currently, this is all handled by the water-abstraction-service and we're not ready to migrate this until we have
 * migrated the refresh functionality (needed by a number of operations)
 *
 * So, as this is handled by the legacy service we need to send the request to it once a user confirms they wish to
 * remove the licence.
 *
 * @param {string} billLicenceId - UUID of the bill licence to be removed
 * @param {module:UserModel} user - Instance representing the user that originated the request
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send (billLicenceId, user) {
  const { id: userId } = user
  const path = `billing/invoice-licences/${billLicenceId}`

  return LegacyRequest.delete('water', path, userId)
}

module.exports = {
  send
}
