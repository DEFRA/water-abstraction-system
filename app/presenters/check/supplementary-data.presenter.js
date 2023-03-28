'use strict'

/**
 * Formats responses from the `SupplementaryDataService`
 * @module SupplementaryDataPresenter
 */

function go (data) {
  const chargeVersions = data.chargeVersions

  return {
    billingPeriods: data.billingPeriods,
    chargeVersions
  }
}

module.exports = {
  go
}
