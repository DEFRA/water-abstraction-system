// check-licence-ended.service.js

'use strict'

/**
 * Service to check if a licence has ended.
 * This service checks the 'ends' date of the licence data and determines if the licence has ended.
 * If it's not within range, we assume it's either lapsed, expired or revoked
 * It returns true if the licence has ended, false otherwise.
 *
 * @param {object} licenceData - The licence data object
 * @returns {boolean} - True if the licence has ended, false otherwise
 */
async function checkLicenceEnded (licenceData) {
  const { ends } = licenceData

  if (!ends) {
    return false
  }

  const endDate = new Date(ends.date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return endDate <= today
}

module.exports = {
  checkLicenceEnded
}
