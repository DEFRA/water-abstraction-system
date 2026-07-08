/**
 * Fetches just the ID and display name for all regions
 * @module FetchRegionsService
 */

import RegionModel from '../../../models/region.model.js'

/**
 * Fetches just the ID and display name for all regions
 *
 * @returns {Promise<object[]>} The display name and ID for all regions in the service ordered by display name
 */
async function go() {
  return RegionModel.query()
    .select(['id', 'displayName'])
    .orderBy([{ column: 'displayName', order: 'asc' }])
}

export { go }
export default {
  go
}
