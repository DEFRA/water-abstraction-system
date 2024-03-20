'use strict'

/**
 * Checks if a licence is 'ended' (expired, lapsed or revoked)
 * @module CheckLicenceService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetch the matching licence and return data needed for the check your answers page
 *
 * Was built to provide the data needed for the '/return-requirements/{id}/check-your-answers' page
 *
 * @param {string} id The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed for "check your answers" page when user submits for approval
 */
async function go (id) {
  const licence = await _fetchLicence(id)
  const licenceEnded = _checkLicenceEnded(licence)
  return licenceEnded
}

async function _fetchLicence (id) {
  return LicenceModel.query()
    .findById(id)
    .select([
      'expiredDate',
      'id',
      'lapsedDate',
      'licenceRef',
      'revokedDate',
      'startDate'
    ])
}

/**
 * Check if a licence has ended.
 * If it's not within range, we assume it's either lapsed, expired or revoked
 * It returns true if the licence has ended, false otherwise.
 *
 * @param {object} licenceData - The licence data object
 * @returns {boolean} - True if the licence has ended, false otherwise
 */
function _checkLicenceEnded (licence) {
  const { $ends: ends } = licence

  if (!ends) {
    return false
  }

  const endDate = new Date(ends.date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return endDate <= today
}

module.exports = {
  go
}
