'use strict'

/**
 * Unflag all licences in a bill run that did not result in a billing invoice (they are unbilled)
 * @module UnflagUnbilledLicencesService
 */

const LicenceModel = require('../../../models/licence.model.js')

/**
 * Unflag any licences that were not billed as part of a bill run
 *
 * Some licences will not result in an invoice (`billing_invoice_licence`) being created. For example, you could add a
 * new charge version that does nothing but change the description of the previous one. In isolation, this would result
 * in an `EMPTY` bill run. If others are being processed at the same time, it would just mean no records are added to
 * the bill run for this licence.
 *
 * If this is the case, we can remove the 'Include in SROC Supplementary Billing' flag from the licence now. Even if the
 * bill run gets cancelled and re-run later the result will be the same.
 *
 * What it also means is we can be accurate with which licences get unflagged when the bill run is finally **SENT**. The
 * PRESROC process doesn't restrict to licences in the bill run. This is because they don't deal with licences that were
 * processed but resulted in no bill in their engine. So, they are forced to consider all flagged licences when the bill
 * run gets 'sent'.
 *
 * There are two scenarios of when _not_ to unflag an unbilled licence
 *
 * - if the licence is in workflow
 * - if the licence was updated after the bill run was created
 *
 * Unlike `UnflagBilledLicencesService` the chances of these events happening between bill run creation and this service
 * running are slim. But we feel it prudent to still check plus it keeps the services consistent.
 *
 * @param {module:BillRunModel} billRun - Instance of the bill run being processed
 * @param {string[]} allLicenceIds - All licence UUIDs being processed in the bill run
 *
 * @returns {Promise<number>} Resolves to the count of records updated
 */
async function go (billRun, allLicenceIds) {
  const { id: billRunId, createdAt } = billRun

  const result = await LicenceModel.query()
    .patch({ includeInSrocBilling: false })
    .where('updatedAt', '<=', createdAt)
    .whereNotExists(
      LicenceModel.relatedQuery('workflows')
        .whereNull('workflows.deletedAt')
    )
    .whereNotExists(
      LicenceModel.relatedQuery('billLicences')
        .join('bills', 'bills.id', '=', 'billLicences.billId')
        .where('bills.billRunId', '=', billRunId)
    )
    .whereIn('id', allLicenceIds)

  return result
}

module.exports = {
  go
}
