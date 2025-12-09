'use strict'

const PointModel = require('../models/point.model.js')

/**
 * Formats Licence points for the view
 *
 * Used by the 'pointsSummaryCards' macro
 *
 * @param {object[]} points - points from the licence version purposes
 *
 * @returns {object[]} - the points formatted to be displayed
 */
function formatLicencePoints(points) {
  return points.map((point) => {
    // NOTE: We create a `PointModel` instance so we can use the `$describe()` instance method
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
