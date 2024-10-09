'use strict'

/**
 * Fetches and voids the returns from the provided date forward
 * @module VoidReturnLogsService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')
const { CycleStartDateByDate } = require('../../../lib/dates.lib.js')

/**
 * Given a licence reference and a date this service voids the return logs from that date forward.
 *
 * @param {string} licenceReference - the reference whose return logs to void
 * @param {string} date - the date from which to void return logs - YYYY-MM-DD
 */
async function go (licenceReference, date) {
  const _date = new Date(date)
  const returnLogs = await _fetchReturnLogs(licenceReference, _date)

  await _voidReturnLogs(returnLogs)
}

async function _fetchReturnLogs (licenceReference, date) {
  const cycleStartDate = CycleStartDateByDate(date, false)

  return ReturnLogModel.query()
    .select(['id'])
    .where('licenceRef', licenceReference)
    .where('startDate', '>=', cycleStartDate)
}

async function _voidReturnLogs (returnLogs) {
  for (const returnLog of returnLogs) {
    await ReturnLogModel.query()
      .patch({ status: 'void' })
      .where('id', returnLog.id)
  }
}

module.exports = {
  go
}
