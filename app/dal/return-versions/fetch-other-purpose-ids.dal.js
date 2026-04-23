'use strict'

/**
 * Fetch the primary and secondary purpose ids from the 'current' version for a licence
 * @module FetchOtherPurposeIdsDal
 */

const LicenceVersionModel = require('../../models/licence-version.model.js')

/**
 * Fetch the primary and secondary purpose ids from the 'current' version for a licence
 *
 * When creating a new return version, users must create at least one return requirement with at least one purpose.
 *
 * For reasons unknown to us, when the legacy service created a return log, it stored a lot of information about the
 * source return requirement in the return log's metadata field.
 *
 * This includes not only the purpose's legacy ID, but the legacy ID of its primary and secondary purpose id. The
 * problem is that in theory, licences can share the same purpose, but the primary and secondary purposes assigned to
 * the purpose for each licence can be different.
 *
 * When creating a new return version, we need to also create the associated return logs. These need to be consistent
 * with how the legacy service created them to avoid breaking any existing functionality. This means populating the
 * metadata field based on the selected purpose for the new return requirement.
 *
 * But we don't store the primary and secondary purposes against the requirement, nor in the session. This means when
 * generating the return logs, we need to know what primary and secondary purposes were assigned for _this_ licence.
 *
 * We do this by fetching the first `licence_version_purpose` for the licence's 'current' version, where the purpose id
 * matches the one selected for the return requirement. From it we fetch the primary and secondary purpose IDs.
 *
 * @param {string} licenceId - The UUID of the licence to identify the primary and secondary purpose IDs
 * @param {string} purposeId - The UUID of the purpose to identify the primary and secondary purpose IDs
 *
 * @returns {Promise<object>} An object containing the fetched primary and secondary purpose IDs
 */
async function go(licenceId, purposeId) {
  const { primaryPurposeId, secondaryPurposeId } = await LicenceVersionModel.query()
    .select('primaryPurposeId', 'secondaryPurposeId')
    .innerJoinRelated('licenceVersionPurposes')
    .where('licenceId', licenceId)
    .andWhere('status', 'current')
    .andWhere('purposeId', purposeId)
    .first()

  return {
    primaryPurposeId,
    secondaryPurposeId
  }
}

module.exports = {
  go
}
