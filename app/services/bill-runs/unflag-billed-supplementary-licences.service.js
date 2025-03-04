'use strict'

/**
 * Unflag all licences in a bill run that resulted in a billing invoice (they are billed)
 * @module UnflagBilledSupplementaryLicencesService
 */

const LicenceModel = require('../../models/licence.model.js')
const LicenceSupplementaryYearModel = require('../../models/licence-supplementary-year.model.js')
const WorkflowModel = require('../../models/workflow.model.js')

/**
 * Unflag all licences in a bill run that resulted in a billing invoice (they are billed)
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
 * @param {module:BillRunModel} billRun - Instance of the bill run being 'sent'
 */
async function go(billRun) {
  const { batchType, scheme } = billRun

  if (scheme === 'alcs') {
    await _unflagOldScheme(billRun)

    return
  }

  if (batchType === 'two_part_supplementary') {
    await _unflagTwoPartTariff(billRun)

    return
  }

  await _unflagStandard(billRun)
}

async function _unflagOldScheme(billRun) {
  const { createdAt, regionId } = billRun

  await LicenceModel.query()
    .patch({ includeInPresrocBilling: 'no' })
    .where('updatedAt', '<=', createdAt)
    .where('regionId', regionId)
    .where('includeInPresrocBilling', 'yes')
    .whereNotExists(LicenceModel.relatedQuery('workflows').whereNull('workflows.deletedAt'))
}

async function _unflagStandard(billRun) {
  const { id: billRunId, createdAt } = billRun

  await LicenceModel.query()
    .patch({ includeInSrocBilling: false })
    .where('updatedAt', '<=', createdAt)
    .whereNotExists(LicenceModel.relatedQuery('workflows').whereNull('workflows.deletedAt'))
    .whereExists(
      LicenceModel.relatedQuery('billLicences')
        .join('bills', 'bills.id', 'billLicences.billId')
        .where('bills.billRunId', billRunId)
    )
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
}

module.exports = {
  go
}
