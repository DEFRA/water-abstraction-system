'use strict'

/**
 * Generates a billing invoice licence record ready for persisting
 * @module GenerateBillingInvoiceLicenceService
 */

const { randomUUID } = require('crypto')

/**
 * Return either a new billing invoice licence object ready for persisting or an existing one if it exists
 *
 * This first checks whether a billing invoice licence with the same invoice and licence ID exists in
 * `generatedBillingInvoiceLicences`. The calling service is expected to provide and keep track of this variable between
 * calls. If it does, it returns that instance along with the original array unchanged.
 *
 * If it doesn't, we generate a new instance and create a new array, based on the one provided plus our new instance. We
 * then return the instance and the new array as the result.
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
 * @param {Object[]} generatedBillingInvoiceLicences An array of previously generated billing invoice licence objects
 * @param {String} billingInvoiceId UUID of the billing invoice this billing invoice licence will be linked to if
 *  persisted
 * @param {module:LicenceModel} licence The licence this billing invoice licence will be linked to
 *
 * @returns {Object} A result object containing either the found or generated billing invoice licence object, and an
 *  array of generated billing invoice licences which includes the one being returned
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
