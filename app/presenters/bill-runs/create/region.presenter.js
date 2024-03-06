'use strict'

/**
 * Formats data for the `/bill-runs/create/{sessionId}/region` page
 * @module RegionPresenter
 */

/**
 * Formats data for the `/bill-runs/create/{sessionId}/region` page
 *
 * @param {module:SessionModel} session - The session instance to format
 * @param {module:RegionsModel[]} regions - UUID and display name of all regions
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session, regions) {
  return {
    id: session.id,
    regions,
    selectedRegion: session.data.region
  }
}

module.exports = {
  go
}
