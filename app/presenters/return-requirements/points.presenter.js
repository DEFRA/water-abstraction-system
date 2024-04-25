'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/points` page
 * @module PointsPresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/points` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {Object} [pointsData] - The points for the licence
 * @param {Object} [payload] - The payload from the request
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session, pointsData) {
  const data = {
    id: session.id,
    licenceId: session.data.licence.id,
    licenceRef: session.data.licence.licenceRef,
    licencePoints: _licencePoints(pointsData),
    selectedPoints: session.data.points ? session.data.points.join(',') : ''
  }

  return data
}

function _licencePoints (pointsData) {
  const abstractionPoints = []

  if (!pointsData) {
    return abstractionPoints
  }

  pointsData.forEach((pointDetail) => {
    abstractionPoints.push(_generateAbstractionContent(pointDetail))
  })

  const uniqueAbstractionPoints = [...new Set(abstractionPoints)]

  return uniqueAbstractionPoints
}

function _generateAbstractionContent (pointDetails) {
  let abstractionPoints = null

  if (pointDetails.NGR4_SHEET && pointDetails.NGR4_NORTH !== 'null') {
    const point1 = `${pointDetails.NGR1_SHEET} ${pointDetails.NGR1_EAST} ${pointDetails.NGR1_NORTH}`
    const point2 = `${pointDetails.NGR2_SHEET} ${pointDetails.NGR2_EAST} ${pointDetails.NGR2_NORTH}`
    const point3 = `${pointDetails.NGR3_SHEET} ${pointDetails.NGR3_EAST} ${pointDetails.NGR3_NORTH}`
    const point4 = `${pointDetails.NGR4_SHEET} ${pointDetails.NGR4_EAST} ${pointDetails.NGR4_NORTH}`

    abstractionPoints = `Within the area formed by the straight lines running between National Grid References ${point1} ${point2} ${point3} and ${point4}`
  } else if (pointDetails.NGR2_SHEET && pointDetails.NGR2_NORTH !== 'null') {
    const point1 = `${pointDetails.NGR1_SHEET} ${pointDetails.NGR1_EAST} ${pointDetails.NGR1_NORTH}`
    const point2 = `${pointDetails.NGR2_SHEET} ${pointDetails.NGR2_EAST} ${pointDetails.NGR2_NORTH}`

    abstractionPoints = `Between National Grid References ${point1} and ${point2}`
  } else {
    const point1 = `${pointDetails.NGR1_SHEET} ${pointDetails.NGR1_EAST} ${pointDetails.NGR1_NORTH}`

    abstractionPoints = `At National Grid Reference ${point1}`
  }

  abstractionPoints += pointDetails.LOCAL_NAME !== undefined ? ` (${pointDetails.LOCAL_NAME})` : ''

  return abstractionPoints
}

module.exports = {
  go
}
