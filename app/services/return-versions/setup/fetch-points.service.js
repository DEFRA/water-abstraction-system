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

  const points = []

  for (const licenceVersionPurpose of licence.$currentVersion().licenceVersionPurposes) {
    points.push(...licenceVersionPurpose.points)
  }

  return points
}

module.exports = {
  go
}
