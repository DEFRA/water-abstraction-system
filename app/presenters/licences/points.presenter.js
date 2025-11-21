'use strict'

/**
 * Formats the licence and related points data for the view licence points page
 * @module PointsPresenter
 */

const PointModel = require('../../models/point.model.js')
const { pluralise } = require('./base-licences.presenter.js')

/**
 * Formats the licence and related points data for the view licence points page
 *
 * @param {object} data - The licence and related points data returned by `FetchLicencePointsService`
 *
 * @returns {object} licence and points data needed by the view template
 */
function go(data) {
  const {
    licence: { id: licenceId, licenceRef },
    points
  } = data

  const licencePoints = _formatLicencePoints(points)

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

function _formatLicencePoints(points) {
  return points.map((point) => {
    const pointInstance = PointModel.fromJson(point)

    return {
      bgsReference: pointInstance.bgsReference ?? '',
      category: pointInstance.category ?? '',
      depth: pointInstance.depth.toString(),
      description: pointInstance.description ?? '',
      gridReference: pointInstance.$describe(),
      hydroInterceptDistance: pointInstance.hydroInterceptDistance.toString(),
      hydroOffsetDistance: pointInstance.hydroOffsetDistance.toString(),
      hydroReference: pointInstance.hydroReference ?? '',
      locationNote: pointInstance.locationNote ?? '',
      note: pointInstance.note ?? '',
      primaryType: pointInstance.primaryType ?? '',
      secondaryType: pointInstance.secondaryType ?? '',
      sourceDescription: pointInstance.sourceDescription ?? '',
      sourceType: pointInstance.sourceType ?? '',
      wellReference: pointInstance.wellReference ?? ''
    }
  })
}

module.exports = {
  go
}
