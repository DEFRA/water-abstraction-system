'use strict'

/**
 * Handles fetching the region name for `/bill-runs/setup/{sessionId}/no-licences` page
 * @module NoLicencesService
 */

const RegionModel = require('../../../models/region.model.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Handles fetching the region name for `/bill-runs/setup/{sessionId}/no-licences` page
 *
 * Supports generating the data needed for the no-licences page in the setup bill run journey. It fetches the regionId
 * from the session record and uses this to look up the display name for the region.
 *
 * @param {string} sessionId - The UUID for setup bill run session record
 *
 * @returns {Promise<string>} The display name of the region
 */
async function go(sessionId) {
  const { region: regionId } = await SessionModel.query().findById(sessionId)
  const { displayName: regionName } = await RegionModel.query().findById(regionId).select('displayName')

  return {
    activeNavBar: 'bill-runs',
    pageTitle: `There are no licences marked for two-part tariff supplementary billing in the ${regionName} region`,
    sessionId
  }
}

module.exports = {
  go
}
