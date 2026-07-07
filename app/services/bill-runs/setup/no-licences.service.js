/**
 * Handles fetching the region name for `/bill-runs/setup/{sessionId}/no-licences` page
 * @module NoLicencesService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import RegionModel from '../../../models/region.model.js'

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
  const { region: regionId } = await FetchSessionDal.go(sessionId)
  const { displayName: regionName } = await RegionModel.query().findById(regionId).select('displayName')

  return {
    activeNavBar: 'bill-runs',
    backlink: `/system/bill-runs/setup/${sessionId}/region`,
    pageTitle: `There are no licences marked for two-part tariff supplementary billing in the ${regionName} region`,
    sessionId
  }
}

export default {
  go
}
