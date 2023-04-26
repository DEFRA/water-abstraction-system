'use strict'

/**
 * Generates a billing invoice licence record ready for persisting
 * @module GenerateBillingInvoiceLicenceService
 */

const { randomUUID } = require('crypto')

/**
 * Return either a new billing invoice licence object ready for persisting or an existing one if it exists
 *
 * This first checks whether the billing invoice id and licence id of `currentBillingInvoiceLicence` match the ones
 * passed to this service. If they do, we return that instance.
 *
 * If they don't, we generate a new instance and return it.
 *
 * For context, this is all to avoid creating `billing_invoice` and `billing_invoice_licence` records unnecessarily. The
 * legacy service will create them first, then determine if there are any transactions to be billed. If there aren't, it
 * then has to go back and delete the records it created.
 *
 * Our intent is to only call the DB when we have records that need persisting. So, we start at the transaction level
 * and only persist `billing_invoice` and `billing_invoice_licence` records that are linked to billable transactions.
 * But to persist the billing transactions we need the foreign keys. So, we generate our billing invoice and billing
 * licence data in memory along with ID's, and use this service to provide the right record when persisting the
 * transaction.
 *
 * @param {module:billingInvoiceLicence} currentBillingInvoiceLicence A billing invoice licence object
 * @param {String} billingInvoiceId UUID of the billing invoice this billing invoice licence will be linked to if
 *  persisted
 * @param {module:LicenceModel} licence The licence this billing invoice licence will be linked to
 *
 * @returns {Object} The current or newly-generated billing invoice licence object
 */
function go (currentBillingInvoiceLicence, billingInvoiceId, licence) {
  if (
    currentBillingInvoiceLicence?.billingInvoiceId === billingInvoiceId &&
    currentBillingInvoiceLicence?.licenceId === licence.licenceId
  ) {
    return currentBillingInvoiceLicence
  }

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
