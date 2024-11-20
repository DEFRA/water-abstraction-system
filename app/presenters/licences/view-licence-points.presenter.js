'use strict'

/**
 * Formats the licence and related points data for the view licence points page
 * @module ViewLicencePointsPresenter
 */

const PointModel = require('../../models/point.model.js')

/**
 * Formats the licence and related points data for the view licence points page
 *
 * @param {object} data - The licence and related points data returned by `FetchLicencePointsService`
 *
 * @returns {object} licence and points data needed by the view template
 */
function go (data) {
  const { licence, points } = data

  const licencePoints = _formatLicencePoints(points)

  return {
    id: licence.id,
    licencePoints,
    licenceRef: licence.licenceRef,
    pageTitle: 'Licence abstraction points'
  }
}

function _formatLicencePoints (points) {
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
