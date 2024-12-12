'use strict'

/**
 * Unflag all licences in a bill run that resulted in a billing invoice (they are billed)
 * @module UnflagBilledLicencesService
 */

const LicenceModel = require('../../../models/licence.model.js')

/**
 * Unflag any licences that were billed as part of a bill run
 *
 * Our `SubmitSendBillRunService` supports both SROC and PRESROC bill runs. But how they unflag bill runs is different.
 *
 * The PRESROC process doesn't restrict to licences in the bill run. This is because they don't deal with licences that
 * were processed but resulted in no bill in their engine. So, they are forced to consider all flagged licences when the
 * bill run gets 'sent'.
 *
 * In SROC we have the `UnflagUnbilledLicencesService` which deals with licences that didn't result in a bill being
 * created during the generation process.
 *
 * Other than that both queries have to deal with the same scenarios of when _not_ to unflag
 *
 * - licences in workflow
 * - licences updated after the bill run was created
 *
 * Essentially, in both cases a user or the import process might have made a change that resulted in the bill run
 * getting flagged. This change will not have been considered as part of the current bill run so needs to be evaluated
 * in the next supplementary bill run. If we remove the flag this won't happen.
 *
 * There is a risk we leave the flag on a licence that was updated for a reason that didn't need it to be included in
 * the next supplementary bill run. But if that is the case no bill will be created and the licence will get unflagged
 * then.
 *
 * @param {module:BillRunModel} billRun - Instance of the bill run being sent
 *
 * @returns {Promise<number>} Resolves to the count of records updated
 */
async function go(billRun) {
  const { scheme } = billRun

  if (scheme === 'sroc') {
    return _updateCurrentScheme(billRun)
  }

  return _updateOldScheme(billRun)
}

/**
 * PRESROC
 *
 * @private
 */
async function _updateOldScheme(billRun) {
  const { createdAt, regionId } = billRun

  return LicenceModel.query()
    .patch({ includeInPresrocBilling: 'no' })
    .where('updatedAt', '<=', createdAt)
    .where('regionId', regionId)
    .where('includeInPresrocBilling', 'yes')
    .whereNotExists(LicenceModel.relatedQuery('workflows').whereNull('workflows.deletedAt'))
}

/**
 * SROC
 *
 * @private
 */
async function _updateCurrentScheme(billRun) {
  const { id: billRunId, createdAt } = billRun

  return LicenceModel.query()
    .patch({ includeInSrocBilling: false })
    .where('updatedAt', '<=', createdAt)
    .whereNotExists(LicenceModel.relatedQuery('workflows').whereNull('workflows.deletedAt'))
    .whereExists(
      LicenceModel.relatedQuery('billLicences')
        .join('bills', 'bills.id', 'billLicences.billId')
        .where('bills.billRunId', billRunId)
    )
}

module.exports = {
  go
}
