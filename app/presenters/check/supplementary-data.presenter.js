'use strict'

/**
 * Formats responses from the `SupplementaryDataService`
 * @module SupplementaryDataPresenter
 */

function go (data) {
  const licences = data.licences.map((licence) => {
    return {
      licenceId: licence.licenceId,
      licenceRef: licence.licenceRef,
      licenceExistsInBilling: licence.numberOfTimesBilled > 0
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
