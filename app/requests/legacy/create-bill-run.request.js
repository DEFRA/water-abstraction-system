/**
 * Connects with the water-abstraction-service to create a bill run
 * @module CreateBillRunRequest
 */

import { postRequest } from '../legacy.request.js'

/**
 * Send a request to the legacy water-abstraction-service to create a bill run
 *
 * @param {string} batchType - the type of bill run the legacy service needs to create. We only expect this to be
 * sending `supplementary` and `two_part_tariff` as annual is now handled by us.
 * @param {string} regionId - UUID of the region the bill run is for
 * @param {number} financialYearEnding - The end year for the financial year to be generated
 * @param {module:UserModel} user - Instance representing the user that originated the request
 * @param {boolean} [summer] - Only relates to two-part tariff. In PRESROC 2PT bill runs were split by summer or winter
 * and all-year. This tells the legacy engine which kind of 2PT bill run to generate
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
export default async function createBillRunRequest(batchType, regionId, financialYearEnding, user, summer = false) {
  const { userId, username: userEmail } = user

  const path = 'billing/batches'
  const body = {
    batchType,
    financialYearEnding,
    regionId,
    isSummer: summer,
    userEmail
  }

  return postRequest('water', path, userId, true, body)
}
