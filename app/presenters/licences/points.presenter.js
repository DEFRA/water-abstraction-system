'use strict'

/**
 * Formats the licence and related points data for the view licence points page
 * @module PointsPresenter
 */

const { pluralise } = require('./base-licences.presenter.js')
const { formatLicencePoints } = require('../licence.presenter.js')

/**
 * Formats the licence and related points data for the view licence points page
 *
 * @param {object[]} points - The points data returned by `FetchLicencePointsService`
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns {object} licence and points data needed by the view template
 */
function go(points, licence) {
  const { id: licenceId, licenceRef } = licence

  const licencePoints = formatLicencePoints(points)

  return {
    backLink: {
      href: `/system/licences/${licenceId}/summary`,
      text: 'Go back to summary'
    },
    licencePoints,
    pageTitle: 'Points',
    pageTitleCaption: `Licence ${licenceRef}`,
    showingPoints: `Showing ${licencePoints.length} abstraction ${pluralise('point', licencePoints.length)}`
  }
}

module.exports = {
  go
}
