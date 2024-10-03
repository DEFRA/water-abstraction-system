'use strict'

/**
 * Fetches the licence and charge version data for the given licenceId
 * @module FetchLicenceChargeVersionsService
 */

const LicenceModel = require('../../models/licence.model.js')
const { ref } = require('objection')
const APRIL = 3
const SIX_YEARS = 6

/**
 * Fetches the licence data for the given id
 * Since supplementary billing only happens for the previous 6 years, we filter out the charge versions to only return
 * those with an end date within the last 6 years
 *
 * @param {string} licenceId - The UUID of the wrls licence
 *
 * @returns {Promise<object>} an object containing our WRLS licence data and filtered charge versions
 */
async function go (licenceId) {
  // First query select 1 or 0 true/false, has the nald licence got a new end date ~ Do this in the import.
  // Have a service in import that does this and then pings my service in supplementary

  // Step 1 Off the 3 dates that have changed on the licence (NALD Licence) which is the earliest
  // Step 2 Work out the 'end date' if its outside of this financial year then we don't care. This is before fetching
  // The charge information

  // Work out the year and pass it through to the query
  const licence = await _fetchLicenceData(licenceId)
  const { chargeVersions } = licence

  licence.chargeVersions = _filterChargeVersions(chargeVersions)

  return licence
}

function _filterChargeVersions (chargeVersions) {
  const financialYearsSixYearsAgo = _financialYearSixYearsAgo()

  const filteredChargeVersions = chargeVersions.filter((chargeVersion) => {
    return chargeVersion.endDate >= financialYearsSixYearsAgo || chargeVersion.endDate === null
  })

  return filteredChargeVersions
}

function _financialYearSixYearsAgo () {
  const date = new Date()
  let year = date.getFullYear()

  if (date.getMonth() >= APRIL) {
    year++
  }

  const sixYearsAgo = year - SIX_YEARS
  const financialYearSixYearsAgo = new Date(sixYearsAgo, APRIL, 1)

  return financialYearSixYearsAgo
}

async function _fetchLicenceData (id) {
  return LicenceModel.query()
    .findById(id)
    .select([
      'id',
      'licenceRef',
      'includeInPresrocBilling',
      'includeInSrocBilling',
      'revokedDate',
      'lapsedDate',
      'expiredDate'
    ])
    .withGraphFetched('chargeVersions')
    .modifyGraph('chargeVersions', (builder) => {
      builder
        .select([
          'id',
          'startDate',
          'endDate'
        ])
    })
    .withGraphFetched('chargeVersions.chargeReferences')
    .modifyGraph('chargeVersions.chargeReferences', (builder) => {
      builder
        .select([
          'id',
          ref('chargeReferences.adjustments:s127').castText().as('s127')
        ])
    })
    .withGraphFetched('chargeVersions.chargeReferences.chargeElements')
    .modifyGraph('chargeVersions.chargeReferences.chargeElements', (builder) => {
      builder
        .select([
          'id',
          'section127Agreement'
        ])
    })
}

module.exports = {
  go
}
