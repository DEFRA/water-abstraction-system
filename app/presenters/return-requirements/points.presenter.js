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

  if (!pointsData ||
    pointsData?.purposes === undefined ||
    pointsData.purposes.length === 0 ||
    pointsData.purposes[0]?.purposePoints === undefined ||
    pointsData.purposes[0]?.purposePoints.length === 0
  ) {
    return {
      abstractionPoints: null
    }
  }

  const abstractionPoints = []

  pointsData.purposes.forEach((purpose) => {
    purpose.purposePoints.forEach((point) => {
      const pointDetail = point.point_detail

      if (pointDetail) {
        abstractionPoints.push(_generateAbstractionContent(pointDetail))
      }
    })
  })

  return abstractionPoints
}

function _generateAbstractionContent (pointDetail) {
  let abstractionPoint = null

  if (pointDetail.NGR4_SHEET && pointDetail.NGR4_NORTH !== 'null') {
    const point1 = `${pointDetail.NGR1_SHEET} ${pointDetail.NGR1_EAST} ${pointDetail.NGR1_NORTH}`
    const point2 = `${pointDetail.NGR2_SHEET} ${pointDetail.NGR2_EAST} ${pointDetail.NGR2_NORTH}`
    const point3 = `${pointDetail.NGR3_SHEET} ${pointDetail.NGR3_EAST} ${pointDetail.NGR3_NORTH}`
    const point4 = `${pointDetail.NGR4_SHEET} ${pointDetail.NGR4_EAST} ${pointDetail.NGR4_NORTH}`

    abstractionPoint = `Within the area formed by the straight lines running between National Grid References ${point1} ${point2} ${point3} and ${point4}`
  } else if (pointDetail.NGR2_SHEET && pointDetail.NGR2_NORTH !== 'null') {
    const point1 = `${pointDetail.NGR1_SHEET} ${pointDetail.NGR1_EAST} ${pointDetail.NGR1_NORTH}`
    const point2 = `${pointDetail.NGR2_SHEET} ${pointDetail.NGR2_EAST} ${pointDetail.NGR2_NORTH}`

    abstractionPoint = `Between National Grid References ${point1} and ${point2}`
  } else {
    const point1 = `${pointDetail.NGR1_SHEET} ${pointDetail.NGR1_EAST} ${pointDetail.NGR1_NORTH}`

    abstractionPoint = `At National Grid Reference ${point1}`
  }

  abstractionPoint += pointDetail.LOCAL_NAME !== undefined ? ` (${pointDetail.LOCAL_NAME})` : ''

  return abstractionPoint
}

module.exports = {
  go
}
