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
  return BillRunModel.query().delete().where('status', 'empty')
}

module.exports = {
  go
}
