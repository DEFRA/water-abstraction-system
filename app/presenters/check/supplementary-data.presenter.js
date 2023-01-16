'use strict'

/**
 * Formats responses from the `SupplementaryDataService`
 * @module SupplementaryDataPresenter
 */

function go (data) {
  const licences = data.licences.map((licence) => {
    const licenceExistsInBilling = _licenceExistsInBilling(licence.billingInvoiceLicences)

    return {
      licenceId: licence.licenceId,
      licenceRef: licence.licenceRef,
      licenceExistsInBilling
    }
  })
  const chargeVersions = data.chargeVersions

  return {
    billingPeriods: data.billingPeriods,
    licences,
    chargeVersions
  }
}

function _licenceExistsInBilling (billingInvoiceLicences) {
  if (billingInvoiceLicences) {
    for (let i = 0; i < billingInvoiceLicences.length; i++) {
      if (billingInvoiceLicences[i].billingInvoice) {
        return true
      }
    }
  }

  return false
}

module.exports = {
  go
}
