'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/points` page
 * @module PointsPresenter
 */

/**
 * Formats data for the `/return-requirements/{sessionId}/points` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {string} requirementIndex - The index of the requirement being added or changed
 * @param {module:LicenceVersionPurposePoint[]} licenceVersionPurposePoints - All licence version purpose points linked
 * to the current licence version
 *
 * @returns {object} - The data formatted for the view template
 */
function go (session, requirementIndex, licenceVersionPurposePoints) {
  const { id: sessionId, licence, requirements } = session
  const requirement = requirements[requirementIndex]

  return {
    backLink: _backLink(session, requirementIndex),
    licenceId: licence.id,
    licencePoints: _licencePoints(licenceVersionPurposePoints),
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

function _licencePoints (licenceVersionPurposePoints) {
  // First extract our points from the data, including generating the descriptions
  const licencePoints = licenceVersionPurposePoints.map((licenceVersionPurposePoint) => {
    return {
      id: licenceVersionPurposePoint.naldPointId,
      description: licenceVersionPurposePoint.$describe()
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
