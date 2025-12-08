'use strict'

const PointModel = require('../models/point.model.js')

/**
 *
 * @param {object[]} points
 *
 * @returns {object[]} - the points formatted to be displayed
 */
function formatLicencePoints(points) {
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
  formatLicencePoints
}
