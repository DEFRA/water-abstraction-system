'use strict'

/**
 * Formats responses from the `SupplementaryDataService`
 * @module SupplementaryDataPresenter
 */

function go (data) {
  const licences = data.licences.map((licence) => {
    return {
      licenceId: licence.licenceId,
      licenceRef: licence.licenceRef
    }
  })
  const chargeVersions = data.chargeVersions

  return {
    billingPeriods: data.billingPeriods,
    licences,
    chargeVersions
  }
}

module.exports = {
  go
}
