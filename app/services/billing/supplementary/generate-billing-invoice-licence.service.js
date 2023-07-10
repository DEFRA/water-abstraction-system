'use strict'

/**
 * Generates a billing invoice licence record ready for persisting
 * @module GenerateBillingInvoiceLicenceService
 */

const { randomUUID } = require('crypto')

/**
 * Return a billing invoice licence object ready for persisting
 *
 * @param {String} billingInvoiceId UUID of the billing invoice this billing invoice licence will be linked to if
 *  persisted
 * @param {module:LicenceModel} licence The licence this billing invoice licence will be linked to
 *
 * @returns {Object} The current or newly-generated billing invoice licence object
 */
function go (billingInvoiceId, licence) {
  const billingInvoiceLicence = {
    billingInvoiceId,
    billingInvoiceLicenceId: randomUUID({ disableEntropyCache: true }),
    licenceRef: licence.licenceRef,
    licenceId: licence.licenceId
  }

  return billingInvoiceLicence
}

module.exports = {
  go
}
