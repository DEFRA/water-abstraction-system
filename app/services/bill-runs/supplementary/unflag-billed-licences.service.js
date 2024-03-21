'use strict'

/**
 * Unflag all licences in a bill run that resulted in a billing invoice (they are billed)
 * @module UnflagUnbilledLicencesService
 */

const LicenceModel = require('../../../models/licence.model.js')

/**
 * Unflag any licences that were billed as part of a bill run
 *
 * Our `SubmitSendBillRunService` supports both SROC and PRESROC bill runs. But how they unflag bill runs is different.
 *
 * In SROC we have the `UnflagUnbilledLicencesService` which deals with licences that didn't result in a bill being
 * created during the generation process. This means when the bill run is finally sent any licences linked to the bill
 * can be confidently unflagged.
 *
 * The legacy PRESROC process doesn't deal with licences that result in no bills created during the generation process.
 * This means it has to rely on comparing the dates when the licences were last updated and the created date of the bill
 * run. Any licences updated before the bill run was created that are flagged for supplementary billing get their
 * flags removed.
 *
 * @param {module:BillRunModel} billRun - Instance of the bill run being sent
 *
 * @returns {Promise<Number>} Resolves to the count of records updated
 */
async function go (billRun) {
  const { scheme } = billRun

  if (scheme === 'sroc') {
    return _updateCurrentScheme(billRun)
  }

  return _updateOldScheme(billRun)
}

/**
 * PRESROC
 */
async function _updateOldScheme (billRun) {
  const { createdAt, regionId } = billRun

  return LicenceModel.query()
    .patch({ includeInPresrocBilling: 'no' })
    .where('updatedAt', '<=', createdAt)
    .where('regionId', regionId)
    .where('includeInPresrocBilling', 'yes')
    .whereNotExists(
      LicenceModel.relatedQuery('workflows')
        .whereNull('workflows.deletedAt')
    )
}

/**
 * SROC
 */
async function _updateCurrentScheme (billRun) {
  const { id: billRunId } = billRun

  return LicenceModel.query()
    .patch({ includeInSrocBilling: false })
    .whereExists(
      LicenceModel.relatedQuery('billLicences')
        .join('bills', 'bills.id', 'billLicences.billId')
        .where('bills.billRunId', billRunId)
    )
}

module.exports = {
  go
}
