'use strict'

/**
 * Formats the licence and related licenceVersionPurposePoints data for the view licence points page
 * @module ViewLicencePointsPresenter
 */

const PointModel = require('../../models/point.model.js')

/**
 * Formats the licence and related licenceVersionPurposePoints data for the view licence points page
 *
 * @param {module:LicenceModel} data - The licence and related licenceVersionPurposePoints data returned by
 * `FetchLicencePointsService`
 *
 * @returns {object} licence and licenceVersionPurposePoints data needed by the view template
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
      category: pointInstance.category,
      gridReference: pointInstance.$describe(),
      description: pointInstance.pointDescription,
      primaryType: pointInstance.primaryType,
      secondaryType: pointInstance.secondaryType,
      sourceDescription: pointInstance.sourceDescription,
      sourceType: pointInstance.sourceType,
      note: pointInstance.note,
      locationNote: pointInstance.locationNote,
      depth: pointInstance.depth,
      bgsReference: pointInstance.bgsReference,
      wellReference: pointInstance.wellReference,
      hydroReference: pointInstance.hydroReference,
      hydroOffsetDistance: pointInstance.hydroOffsetDistance
    }
  })
}

module.exports = {
  go
}
