'use strict'

/**
 * Fetches all LicenceVersionPurposePoints for the matching licenceId
 * @module FetchPointsService
 */

const LicenceModel = require('../../../models/licence.model.js')

/**
 * Fetches all LicenceVersionPurposePoints for the matching licenceId
 *
 * @param {string} licenceId - The UUID for the licence to fetch points for
 *
 * @returns {Promise<module:LicenceVersionPurposePoints[]>} All LicenceVersionPurposePoints for the matching licenceId
 */
async function go(licenceId) {
  return _fetch(licenceId)
}

// NOTE: We could have gone direct to the LicenceVersionPurposePoints table and then worked back to the selected
// licence. But we have the added complexity of only wanting the points for the current licence version, something we
// already have logic for on the licence model.
//
// It made sense to go from licence to the points via our 'currentVersion' modifier. It just means we need to bring
// the points back into a single array afterwards.
async function _fetch(licenceId) {
  const licence = await LicenceModel.query()
    .findById(licenceId)
    .select(['id'])
    .modify('currentVersion')
    .withGraphFetched('licenceVersions.licenceVersionPurposes.points')
    .modifyGraph('licenceVersions.licenceVersionPurposes.points', (builder) => {
      builder.select(['points.id', 'points.description', 'points.ngr1', 'points.ngr2', 'points.ngr3', 'points.ngr4'])
    })

  const points = _uniqueCurrentPoints(licence)

  return _sortPoints(points)
}

function _sortPoints(points) {
  return points.sort((a, b) => {
    if (a.ngr1 > b.ngr1) {
      return 1
    }

    if (a.ngr1 < b.ngr1) {
      return -1
    }

    return 0
  })
}

/**
 * Reduces the points in the licenceVersionPurposes to a flat, unique array of points
 *
 * When a new return version is being created, we are required to only display the points from the current licence
 * version. The first thing this function has to do is using the `$currentVersion()` model modifier, iterate the
 * purposes linked to it.
 *
 * The next scenario we are expected to handle, is where a licence has multiple purposes, but two or more link to the
 * same point. If we just added all points from each purpose to our result, it would result in duplicate PointModel
 * records being returned.
 *
 * We need to ensure that the list of points we ask the user to select from doesn't contain duplicates. Hence the use
 * of `uniquePointsIds` to help us determine if we have already added a point to our result.
 *
 * @param {module:licence} licence - The licence to fetch points for
 *
 * @returns {module:PointModel[]}
 */
function _uniqueCurrentPoints(licence) {
  const uniquePointsIds = []
  const points = []

  for (const licenceVersionPurpose of licence.$currentVersion().licenceVersionPurposes) {
    for (const point of licenceVersionPurpose.points) {
      if (uniquePointsIds.includes(point.id)) {
        continue
      }

      uniquePointsIds.push(point.id)
      points.push(point)
    }
  }

  return points
}

module.exports = {
  go
}
