'use strict'

/**
 * Deletes empty bill runs
 * @module CleanEmptyBillRunsService
 */

const BillRunModel = require('../../../models/bill-run.model.js')

/**
 * Deletes empty bill runs
 *
 * @returns {Promise<number>} The number of rows deleted
 */
async function go() {
  try {
    return await BillRunModel.query().delete().where('status', 'empty')
  } catch (error) {
    global.GlobalNotifier.omfg('Clean job failed', { job: 'clean-empty-bill-runs' }, error)
  }
}

module.exports = {
  go
}
