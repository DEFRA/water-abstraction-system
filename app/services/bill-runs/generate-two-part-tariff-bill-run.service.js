'use strict'

/**
 * Checks a two-part tariff bill run can be generated, then determines which generate engine to use
 * @module GenerateTwoPartTariffBillRunService
 */

const BillRunModel = require('../../models/bill-run.model.js')
const ExpandedError = require('../../errors/expanded.error.js')
const { timestampForPostgres } = require('../../lib/general.lib.js')
const GenerateAnnualBillRun = require('./two-part-tariff/generate-bill-run.service.js')
const GenerateSupplementaryBillRun = require('./tpt-supplementary/generate-bill-run.service.js')

/**
 * Checks a two-part tariff bill run can be generated, then determines which generate engine to use
 *
 * The actual work of generating the bill run is handled by the `GenerateBillRunService`s in two-part-tariff and
 * tpt-supplementary folders.
 *
 * But for both types we need to
 *
 * - fetch the bill run instance
 * - check it has a status that permits the bill run to be generated
 * - set the status to `processing` so both the user and the system knows it is being worked on
 *
 * Having this service means the endpoint that triggers the process just has one service to call, and these actions can
 * be performed in one place.
 *
 * Once complete, it then determines the engine to use and calls it. Note, we don't await the engine generate calls.
 *
 * We need the user to wait whilst we validate and update the bill run's status. But we don't want them waiting (and
 * possibly timing out) whilst we generate the bill run itself.
 *
 * @param {string} billRunId - The UUID of the two-part tariff bill run that is ready for generating
 */
async function go(billRunId) {
  const billRun = await _fetchBillRun(billRunId)

  _validate(billRun)

  await _markAsProcessing(billRun)

  // NOTE: We do not await this call intentionally. We don't want to block the user while we generate the bill run
  _generateBillRun(billRun)
}

async function _fetchBillRun(billRunId) {
  return BillRunModel.query()
    .findById(billRunId)
    .select(['id', 'batchType', 'createdAt', 'externalId', 'regionId', 'scheme', 'status', 'toFinancialYearEnding'])
}

async function _generateBillRun(billRun) {
  if (billRun.batchType === 'two_part_supplementary') {
    GenerateSupplementaryBillRun.go(billRun)

    return
  }

  GenerateAnnualBillRun.go(billRun)
}

async function _markAsProcessing(billRun) {
  const { id, status } = billRun

  // If the 'review' step was skipped, the bill run will already have a state of 'processing'
  if (status === 'review') {
    await BillRunModel.query().findById(id).patch({ status: 'processing', updatedAt: timestampForPostgres() })
  }
}

function _validate(billRun) {
  const { batchType, id: billRunId, status } = billRun

  // 'review' is valid for both two-part tariff bill run types
  if (status === 'review') {
    return
  }

  // 'processing' is valid for supplementary. It signifies that the match and allocate step found no licences to
  // process. But there still might be licences we need to credit hence we carry on
  if (batchType === 'two_part_supplementary' && status === 'processing') {
    return
  }

  throw new ExpandedError('Cannot process a two-part tariff bill run that is not in a valid state', {
    batchType,
    billRunId,
    status
  })
}

module.exports = {
  go
}
