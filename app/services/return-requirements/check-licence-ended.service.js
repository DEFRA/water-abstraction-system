'use strict'

/**
 * Checks if a licence is 'ended' (expired, lapsed or revoked)
 * @module CheckLicenceEndedService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Checks if a licence is 'ended' (expired, lapsed or revoked)
 *
 * A licence ended if it has expired, lapsed or revoked on or before the current date. Because we need to check this
 * in a number of places we have the `LicenceModel` instance method `$ends()` to do this for us.
 * 
 * But for that to work you have to fetch the licence and the 3 dates from the licence record. This service combines
 * fetching the licence and the dates then returning the result of `$ends()` to whatever service calls it.
 *
 * @param {string} id - The UUID for the licence to fetch
 *
 * @returns {Promise<boolean>} true if the licence has ended else false
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
