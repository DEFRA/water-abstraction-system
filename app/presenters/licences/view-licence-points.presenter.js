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
      bgsReference: pointInstance.bgsReference ? pointInstance.bgsReference : '',
      category: pointInstance.category ? pointInstance.category : '',
      depth: pointInstance.depth.toString(),
      description: pointInstance.description ? pointInstance.description : '',
      gridReference: pointInstance.$describe(),
      hydroInterceptDistance: pointInstance.hydroInterceptDistance.toString(),
      hydroOffsetDistance: pointInstance.hydroOffsetDistance.toString(),
      hydroReference: pointInstance.hydroReference ? pointInstance.hydroReference : '',
      locationNote: pointInstance.locationNote ? pointInstance.locationNote : '',
      note: pointInstance.note ? pointInstance.note : '',
      primaryType: pointInstance.primaryType ? pointInstance.primaryType : '',
      secondaryType: pointInstance.secondaryType ? pointInstance.secondaryType : '',
      sourceDescription: pointInstance.sourceDescription ? pointInstance.sourceDescription : '',
      sourceType: pointInstance.sourceType ? pointInstance.sourceType : '',
      wellReference: pointInstance.wellReference ? pointInstance.wellReference : ''
    }
  })
}

module.exports = {
  go
}
