'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/points` page
 * @module PointsPresenter
*/

const { generateAbstractionPointDetail } = require('../../lib/general.lib.js')

/**
 * Formats data for the `/return-requirements/{sessionId}/points` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {string} requirementIndex - The index of the requirement being added or changed
 * @param {object[]} pointsData - The points data from the licence
 *
 * @returns {object} - The data formatted for the view template
 */
function go (session, requirementIndex, pointsData) {
  const { id: sessionId, licence, requirements } = session
  const requirement = requirements[requirementIndex]

  return {
    backLink: _backLink(session, requirementIndex),
    licenceId: licence.id,
    licencePoints: _licencePoints(pointsData),
    licenceRef: licence.licenceRef,
    points: requirement?.points ? requirement.points.join(',') : '',
    sessionId
  }
}

function _backLink (session, requirementIndex) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-requirements/${id}/check`
  }

  return `/system/return-requirements/${id}/purpose/${requirementIndex}`
}

function _licencePoints (pointsData) {
  const abstractionPoints = []

  if (!pointsData) {
    return abstractionPoints
  }

  pointsData.forEach((pointDetail) => {
    const point = {
      id: pointDetail.ID,
      description: generateAbstractionPointDetail(pointDetail)
    }

    if (_pointNotInArray(abstractionPoints, point)) {
      abstractionPoints.push(point)
    }
  })

  return abstractionPoints
}

function _pointNotInArray (abstractionPointsArray, abstractionPoint) {
  return !abstractionPointsArray.some((point) => {
    return point.id === abstractionPoint.id
  })
}

module.exports = {
  go
}
