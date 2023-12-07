'use strict'

/**
 * Fetches 2PT Licences for the matching region and billing period
 * @module FetchLicencesService
 */

const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')

/**
 *
 * @param {*} regionId
 * @param {*} billingPeriod
 * @param {*} licenceId
 *
 * @returns
 */
async function go (regionId, billingPeriod, licenceId) {
  const chargeVersions = await FetchChargeVersionsService.go(regionId, billingPeriod, licenceId)

  const uniqueLicenceIds = _extractUniqueLicenceIds(chargeVersions)

  return _groupByLicence(chargeVersions, uniqueLicenceIds)
}

function _extractUniqueLicenceIds (chargeVersions) {
  const allLicenceIds = chargeVersions.map((chargeVersion) => {
    return chargeVersion.licence.id
  })

  return [...new Set(allLicenceIds)]
}

function _groupByLicence (chargeVersions, uniqueLicenceIds) {
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

    licences[i] = {
      licenceId,
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
