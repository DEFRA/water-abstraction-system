'use strict'

/**
 * Formats responses from the `SupplementaryService`
 * @module SupplementaryPresenter
 */

function go (data) {
  const licences = data.licences.map((licence) => {
    return {
      licenceId: licence.licenceId,
      licenceRef: licence.licenceRef
    }
  })
  const chargeVersions = data.chargeVersions.map((chargeVersion) => {
    return {
      chargeVersionId: chargeVersion.chargeVersionId,
      licenceRef: chargeVersion.licenceRef,
      licenceId: chargeVersion.licenceId,
      scheme: chargeVersion.scheme,
      startDate: chargeVersion.startDate,
      endDate: chargeVersion.endDate
    }
  })

  return {
    billingPeriods: data.billingPeriods,
    licences,
    chargeVersions
  }
}

module.exports = {
  go
}
