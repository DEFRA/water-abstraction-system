'use strict'

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/region` page
 * @module RegionPresenter
 */

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/region` page
 *
 * @param {module:SessionModel} session - The session instance to format
 * @param {module:RegionsModel[]} regions - UUID and display name of all regions
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, regions) {
  return {
    backlink: `/system/bill-runs/setup/${session.id}/type`,
    pageTitle: 'Select the region',
    regions,
    sessionId: session.id,
    selectedRegion: session.region ? session.region : null
  }
}

module.exports = {
  go
}
