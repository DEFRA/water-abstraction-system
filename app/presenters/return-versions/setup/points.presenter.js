'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/points` page
 * @module PointsPresenter
 */

/**
 * Formats data for the `/return-versions/setup/{sessionId}/points` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {string} requirementIndex - The index of the requirement being added or changed
 * @param {module:PointModel[]} points - All points linked to the licence version purposes linked to the current licence
 * version
 *
 * @returns {object} - The data formatted for the view template
 */
function go (session, requirementIndex, points) {
  const { id: sessionId, licence, requirements } = session
  const requirement = requirements[requirementIndex]

  return {
    backLink: _backLink(session, requirementIndex),
    licenceId: licence.id,
    licencePoints: _licencePoints(points),
    licenceRef: licence.licenceRef,
    selectedPointIds: requirement?.points ? requirement.points.join(',') : '',
    sessionId
  }
}

function _backLink (session, requirementIndex) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-versions/setup/${id}/check`
  }

  return `/system/return-versions/setup/${id}/purpose/${requirementIndex}`
}

function _licencePoints (points) {
  // First extract our points from the data, including generating the descriptions
  const licencePoints = points.map((point) => {
    return {
      id: point.id,
      description: point.$describe()
    }
  })

  // Then sort by the descriptions to give us a consistent display order
  return licencePoints.sort((first, second) => {
    // NOTE: localeCompare() handles dealing with values in different cases automatically! So we don't have to lowercase
    // everything before then comparing.
    return first.description.localeCompare(second.description)
  })
}

module.exports = {
  go
}
