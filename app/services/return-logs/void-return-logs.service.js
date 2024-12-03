'use strict'

/**
 * Fetches and voids the returns from the provided date forward
 * @module VoidReturnLogsService
 */

const ReturnLogModel = require('../../models/return-log.model.js')
const { cycleStartDateByDate } = require('../../lib/return-cycle-dates.lib.js')

/**
 * Given a licence reference and a date this service voids the return logs from that date forward.
 *
 * @param {string} licenceReference - the reference whose return logs to void
 * @param {Date} date - the date from which to void return logs - YYYY-MM-DD
 */
async function go(licenceReference, date) {
  await ReturnLogModel.query()
    .patch({ status: 'void' })
    .where('licenceRef', licenceReference)
    .where('endDate', '>=', date)

  // const allYearReturnLogs = await _fetchReturnLogs(licenceReference, date, false)
  // const summerReturnLogs = await _fetchReturnLogs(licenceReference, date, true)

  // await _voidReturnLogs([...allYearReturnLogs, ...summerReturnLogs])
}

async function _fetchReturnLogs(licenceReference, date, summer) {
  const cycleStartDate = cycleStartDateByDate(date, summer)

  return await ReturnLogModel.query()
    .select(['returnLogs.id'])
    .innerJoinRelated('returnCycle')
    .where('returnLogs.licenceRef', licenceReference)
    .where('returnLogs.startDate', '>=', cycleStartDate)
    .where('returnCycle.summer', summer)
}

async function _voidReturnLogs(returnLogs) {
  for (const returnLog of returnLogs) {
    await ReturnLogModel.query().patch({ status: 'void' }).where('id', returnLog.id)
  }
}

module.exports = {
  go
}
