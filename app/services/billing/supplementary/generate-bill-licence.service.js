'use strict'

/**
 * Generates a bill licence record ready for persisting
 * @module GenerateBillLicenceService
 */

const { generateUUID } = require('../../../lib/general.lib.js')

/**
 * Return a bill licence object ready for persisting
 *
 * @param {String} billId UUID of the bill this bill licence will be linked to if
 *  persisted
 * @param {module:LicenceModel} licence The licence this bill licence will be linked to
 *
 * @returns {Object} The current or newly-generated bill licence object
 */
function go (billId, licence) {
  const billLicence = {
    billingInvoiceId: billId,
    billingInvoiceLicenceId: generateUUID(),
    licenceRef: licence.licenceRef,
    licenceId: licence.licenceId
  }

  return billLicence
}

module.exports = {
  go
}
