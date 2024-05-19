'use strict'

/**
 * Fetches a licence's abstraction conditions needed for the summary tab on the view '/licences/{id}` page
 * @module FetchLicenceAbstractionConditionsService
 */

const LicenceVersionPurposeModel = require('../../models/licence-version-purpose.model.js')

/**
 * Fetches a licence's abstraction conditions needed for the summary tab on the view '/licences/{id}` page
 *
 * Each time a licence is changed in the upstream NALD system a new 'version is generated, the latest of which becomes
 * the 'current' version.
 *
 * Linked to each version could be multiple purposes for the abstraction, for example, spray irrigation and mineral
 * washing.
 *
 * Then each purpose might have one or more conditions attached to it. Where things get complex is the same condition
 * can be attached to more than one purpose and we're trying to show a distinct list of abstraction conditions for the
 * licence. But we still need a count of them all!
 *
 * This service is able to determine the purposes for the current licence version and their conditions then extract the
 * display title for each one. The total number of results gives us the abstraction condition count we need. As there
 * may be duplicates in the titles we process the results to determine the distinct list needed. Finally, just in case
 * we also provide a distinct list of the purpose IDs :-)
 *
 * @param {string} licenceVersionId - The UUID for the 'current' licence version record of the licence being viewed
 *
 * @returns {Promise<Object>} An object containing the processed results for all the abstraction conditions for the
 * current version of the licence. It contains an array of distinct condition titles, the purpose IDs they were linked
 * to and the total count of conditions for the licence version.
 */
async function go (licenceVersionId) {
  const results = await _fetch(licenceVersionId)

  return _processResults(results)
}

function _fetch (licenceVersionId) {
  // NOTE: We have found in testing that there are incomplete licences in the DB, for example, with no licence versions.
  // If we are dealing with such a licence licenceVersionId will be undefined. As this service knows how to format the
  // results for downstream services we handle it here rather than in the calling service.
  if (!licenceVersionId) {
    return []
  }

  return LicenceVersionPurposeModel.query()
    .distinct([
      'licenceVersionPurposes.purposeId',
      'licenceVersionPurposeConditionTypes.displayTitle'
    ])
    .innerJoin('licenceVersionPurposeConditions', 'licenceVersionPurposes.id', 'licenceVersionPurposeConditions.licenceVersionPurposeId')
    .innerJoin('licenceVersionPurposeConditionTypes', 'licenceVersionPurposeConditions.licenceVersionPurposeConditionTypeId', 'licenceVersionPurposeConditionTypes.id')
    .where('licenceVersionPurposes.licenceVersionId', licenceVersionId)
    .orderBy([
      { column: 'licenceVersionPurposeConditionTypes.displayTitle', order: 'asc' }
    ])
}

function _processResults (results) {
  const allDisplayTitles = []
  const allPurposeIds = []

  results.forEach((result) => {
    allDisplayTitles.push(result.displayTitle)
    allPurposeIds.push(result.purposeId)
  })

  return {
    conditions: [...new Set(allDisplayTitles)],
    purposeIds: [...new Set(allPurposeIds)],
    numberOfConditions: results.length
  }
}

module.exports = {
  go
}
