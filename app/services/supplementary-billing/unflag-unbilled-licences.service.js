'use strict'

/**
 * Unflag all licences in a bill run that did not result in a billing invoice (they are unbilled)
 * @module UnflagUnbilledLicencesService
 */

const LicenceModel = require('../../models/water/licence.model.js')

/**
 * Unflag any licences that were not billed as part of a bill run
 *
 * Some licences will not result in an invoice (`billing_invoice_licence`) being created. For example, you could add a
 * new charge version that does nothing but change the description of the previous one. In isolation, this would result
 * in an `EMPTY` bill run. If others are being processed at the same time, it would just mean no records are added to
 * the bill run for this licence.
 *
 * If this is the case, we can remove the 'Include in SROC Supplementary Billing' flag from the licence now. Even if
 * the bill run gets cancelled and re-run later the result will be the same.
 *
 * What it also means is we can be accurate with which licences get unflagged when the bill run is finally **SENT**. In
 * the old logic they simply unflag any licence in a region where `date_updated` is less than the bill run's
 * created date. But we know this is flawed because a licence can be updated after a bill run is created, for example
 * the NALD import process updates them all. If this happens the flag remains on.
 *
 * The query we run during the **SEND** process unflags only those which are linked to the bill run being sent. We can
 * do this because we know this service has handled anything that was unbilled and not represented.
 *
 * @param {*} billingBatchId The ID of the bill run (billing batch) being processed
 * @param {String[]} allLicenceIds All licence IDs being processed in the bill run
 * @returns {Number} count of records updated
 *
 * TODO: The return here isn't quite right -- it returns an Objection query, which will itself return a number once it's
 * run -- but we don't run it here. So we can either change the docs to match the code, or change the code to match the
 * docs -- something to check with Alan.
 */
async function go (billingBatchId, allLicenceIds) {
  return LicenceModel.query()
    .patch({ includeInSrocSupplementaryBilling: false })
    .whereIn('licenceId', allLicenceIds)
    .whereNotExists(
      LicenceModel.relatedQuery('billingInvoiceLicences')
        .join('billingInvoices', 'billingInvoices.billingInvoiceId', '=', 'billingInvoiceLicences.billingInvoiceId')
        .where('billingInvoices.billingBatchId', '=', billingBatchId)
    )
}

module.exports = {
  go
}
