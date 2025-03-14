'use strict'

/**
 * Fetches two-part tariff licences for the bill run and billing period to be matched & allocated against
 * @module FetchLicencesService
 */

const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')

/**
 * Fetches two-part tariff licences for the bill run and billing period to be matched & allocated against
 *
 * @param {module:BillRunModel} billRun - The bill run being processed
 * @param {object} billingPeriod - Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Promise<object[]>} the licences to be matched, each containing an array of charge versions applicable for
 * two-part tariff
 */
async function go(billRun, billingPeriod) {
  const chargeVersions = await FetchChargeVersionsService.go(billRun, billingPeriod)

  const uniqueLicenceIds = _extractUniqueLicenceIds(chargeVersions)

  return _groupByLicence(chargeVersions, uniqueLicenceIds)
}

function _extractUniqueLicenceIds(chargeVersions) {
  const allLicenceIds = chargeVersions.map((chargeVersion) => {
    return chargeVersion.licence.id
  })

  return [...new Set(allLicenceIds)]
}

function _groupByLicence(chargeVersions, uniqueLicenceIds) {
  // NOTE: We could have initialized licences as an empty array and pushed each new object. But for a big region
  // the number of licences we might be dealing will be in the hundreds, possibly thousands. In these cases we get a
  // performance bump if we create the array sized to our needs first, rather than asking Node to resize the array on
  // each loop. Only applicable here though! Don't go doing this for every new array you declare ;-)
  const licences = Array(uniqueLicenceIds.length).fill(undefined)

  for (let i = 0; i < uniqueLicenceIds.length; i++) {
    const licenceId = uniqueLicenceIds[i]
    const matchedChargeVersions = chargeVersions.filter((chargeVersion) => {
      return chargeVersion.licence.id === licenceId
    })

    const { licenceRef, startDate, expiredDate, lapsedDate, revokedDate } = matchedChargeVersions[0].licence

    const licenceHolder = matchedChargeVersions[0].licence.$licenceHolder()

    licences[i] = {
      id: licenceId,
      licenceHolder,
      licenceRef,
      startDate,
      expiredDate,
      lapsedDate,
      revokedDate,
      chargeVersions: matchedChargeVersions
    }
  }

  return licences
}

module.exports = {
  go
}
