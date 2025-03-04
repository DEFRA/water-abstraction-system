'use strict'

/**
 * Unflag all licences in a bill run that did not result in a billing invoice (they are unbilled)
 * @module UnflagUnbilledSupplementaryLicencesService
 */

const BillLicenceModel = require('../../models/bill-licence.model.js')
const LicenceModel = require('../../models/licence.model.js')
const LicenceSupplementaryYearModel = require('../../models/licence-supplementary-year.model.js')
const WorkflowModel = require('../../models/workflow.model.js')

/**
 * Unflag all licences in a bill run that did not result in a billing invoice (they are unbilled)
 *
 * Some licences will not result in an invoice (`billing_invoice_licence`) being created. For example, you could add a
 * new charge version that does nothing but change the description of the previous one. In isolation, this would result
 * in an `EMPTY` bill run. If others are being processed at the same time, it would just mean no records are added to
 * the bill run for this licence.
 *
 * If this is the case, we can remove the 'Supplementary Billing' flag from the licence now. Even if the bill run gets
 * cancelled and re-run later the result would be the same.
 *
 * What it also means is unlike the legacy service, we can be accurate with which licences get unflagged when the bill
 * run is finally **SENT**. The legacy PRESROC process doesn't unflag just licences in the bill run. This is because
 * they don't deal with licences that were processed but resulted in no bill in their billing engine. So, they are
 * forced to consider all flagged licences when the bill run gets 'sent'.
 *
 * A licence is flagged for _standard_ supplementary by a tick on the licence record itself. It is flagged for two-part
 * tariff with an entry in `licence_supplementary_years`. Hence, when we 'unflag', we have to do it in two different
 * ways.
 *
 * For either type of flag, we don't 'unflag' if the licence is in workflow. This is because when a licence is gets
 * 'moved to workflow' (has a workflow record with no deleted date), it doesn't automatically get a supplementary flag
 * applied. But its there because the team are doing something with the licence, so billing needs to be suspended.
 *
 * We also don't remove the _standard_ supplementary flag if the licence record is updated _after_ the bill run is
 * created. This tells us _something_ has changed on the licence since the bill run was created. So, just in case, we
 * want the licence to be processed again in the next supplementary bill run.
 *
 * > The use of `licence_supplementary_years` was brought in when we added support for flagging for 2PT SROC
 * > supplementary. It means we don't have to worry about comparing the dates. It also means we can be more accurate
 * > about when changes apply from. We hope to move standard SROC supplementary to it in the future.
 *
 * @param {module:BillRunModel} billRun - Instance of the bill run being processed
 * @param {string[]} [allLicenceIds=[]] - If a standard supplementary all licence UUIDs being processed in the bill run
 */
async function go(billRun, allLicenceIds = []) {
  if (billRun.batchType === 'two_part_supplementary') {
    await _unflagTwoPartTariff(billRun)

    return
  }

  await _unflagStandard(billRun, allLicenceIds)
}

async function _unflagStandard(billRun, allLicenceIds) {
  const { id: billRunId, createdAt } = billRun

  await LicenceModel.query()
    .patch({ includeInSrocBilling: false })
    .where('updatedAt', '<=', createdAt)
    .whereNotExists(LicenceModel.relatedQuery('workflows').whereNull('workflows.deletedAt'))
    .whereNotExists(
      LicenceModel.relatedQuery('billLicences')
        .join('bills', 'bills.id', '=', 'billLicences.billId')
        .where('bills.billRunId', '=', billRunId)
    )
    .whereIn('id', allLicenceIds)
}

async function _unflagTwoPartTariff(billRun) {
  const { id: billRunId } = billRun

  await LicenceSupplementaryYearModel.query()
    .delete()
    .where('billRunId', billRunId)
    .whereNotExists(
      WorkflowModel.query()
        .select(1)
        .whereColumn('licenceSupplementaryYears.licenceId', 'workflows.licenceId')
        .whereNull('workflows.deletedAt')
    )
    .whereNotExists(
      BillLicenceModel.query()
        .select(1)
        .innerJoin('bills', 'bills.id', '=', 'billLicences.billId')
        .whereColumn('licenceSupplementaryYears.licenceId', 'billLicences.licenceId')
        .where('bills.billRunId', '=', billRunId)
    )
}

module.exports = {
  go
}
