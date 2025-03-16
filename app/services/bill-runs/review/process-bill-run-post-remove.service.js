'use strict'

/**
 * Determines if a two-part tariff bill run is now empty (all licences removed) and if so what to do next
 * @module ProcessBillRunPostRemove
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')
const GenerateTwoPartTariffBillRunService = require('../generate-two-part-tariff-bill-run.service.js')

/**
 * Determines if a two-part tariff bill run is now empty (all licences removed) and if so what to do next
 *
 * If the bill run being reviewed is two-part tariff annual, and the last licence is removed, we simply update its
 * status to 'empty'.
 *
 * However, if it is a two-part tariff annual, it still needs to be processed as there might be licences that were
 * flagged because two-part tariff has been removed from them. This means any previous bills need to be checked in case
 * credits need to be raised. In this case, we call `GenerateTwoPartTariffBillRunService` though we don't await it.
 *
 * Either way, the result will be the user is redirected to the bill runs page, where the status will give an
 * indication of what is happening with the bill run.
 *
 * @param {string} billRunId - UUID of the two-part tariff bill run being processed post a review licence being removed
 *
 * @returns {Promise<boolean>} true if it was the last review licence in the bill run, else false
 */
async function go(billRunId) {
  const billRun = await _fetchBillRun(billRunId)

  const empty = billRun.reviewLicences.length === 0

  if (empty) {
    await _processEmptyBillRun(billRun)
  }

  return empty
}

async function _fetchBillRun(billRunId) {
  // We don't need all these fields for the logic in this service. But if we have to trigger the TPT supplementary
  // generate service, then it will need an instance of the bill run with all this extra data.
  return BillRunModel.query()
    .findById(billRunId)
    .select(['id', 'batchType'])
    .withGraphFetched('reviewLicences')
    .modifyGraph('reviewLicences', (reviewLicencesBuilder) => {
      reviewLicencesBuilder.select(['id'])
    })
}

async function _processEmptyBillRun(billRun) {
  // If it is a two-part tariff annual bill run, we only need to consider the licences that were matched and allocated,
  // and if all those have been removed then the bill run is empty.
  if (billRun.batchType === 'two_part_tariff') {
    await BillRunModel.query().findById(billRun.id).patch({ status: 'empty', updatedAt: timestampForPostgres() })

    return
  }

  // However, if it is two-part tariff supplementary then we still have to check for previous transactions that might
  // need to be credited. This means we need to trigger the generate process to handle this. It will do its work in
  // the background, meantime we'll return control to the user and the they'll be redirected to the bill runs page.
  GenerateTwoPartTariffBillRunService.go(billRun.id)
}

module.exports = {
  go
}
