'use strict'

/**
 * Deletes empty bill runs
 * @module CleanEmptyBillRunsService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const CancelBillBunService = require('../../bill-runs/cancel/cancel-bill-run.service.js')
const DeleteBillRunService = require('../../bill-runs/cancel/delete-bill-run.service.js')
const UnassignBillRunToLicencesService = require('../../bill-runs/unassign-bill-run-to-licences.service.js')

/**
 * Deletes empty bill runs
 *
 * @returns {Promise<number>} The number of rows deleted
 */
async function go() {
  let billRunId
  let deletedCount = 0

  try {
    const emptyBillRuns = await _fetch()

    for (const emptyBillRun of emptyBillRuns) {
      billRunId = emptyBillRun.id

      const deleted = await _deleteEmptyBillRun(billRunId)

      // Up the count if the bill run was deleted
      deletedCount = deleted ? deletedCount + 1 : deletedCount
    }

    return deletedCount
  } catch (error) {
    global.GlobalNotifier.omfg('Clean job failed', { billRunId, job: 'clean-empty-bill-runs' }, error)
  }
}

async function _deleteEmptyBillRun(billRunId) {
  const billRun = await CancelBillBunService.go(billRunId)

  if (billRun.status !== 'cancel') {
    return false
  }

  await UnassignBillRunToLicencesService.go(billRun.id)
  await DeleteBillRunService.go(billRun)

  return true
}

async function _fetch() {
  return BillRunModel.query().select(['id']).where('status', 'empty')
}

module.exports = {
  go
}
