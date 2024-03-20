'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/points` page
 * @module PointsPresenter
*/

function go (session, pointsData, payload = {}) {
  const data = {
    id: session.id,
    licenceId: session.data.licence.id,
    licenceRef: session.data.licence.licenceRef,
    licencePoints: _licencePoints(pointsData, payload)
  }

  return data
}

function _licencePoints (pointsData, payload) {
  const points = payload.points

  if (points) {
    return points
  }

  if (!pointsData || pointsData === undefined) {
    return {
      abstractionPoints: null
    }
  }

  const abstractionPoints = []

  pointsData.forEach((pointDetail) => {
    if (pointDetail) {
      abstractionPoints.push(_generateAbstractionContent(pointDetail))
    }
  })

  return abstractionPoints
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
