'use strict'

/**
 * @module FetchLicenceChargeVersionsService
 */

const LicenceModel = require('../../../models/licence.model.js')
const { ref } = require('objection')
const APRIL = 3

/**
 *  hah
 * @param {*} licenceId
 * @returns
 */
async function go (licenceId) {
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

  const sixYearsAgo = year - 6
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
