'use strict'

/**
 * Fetches and voids the returns from the provided date forward
 * @module VoidReturnLogsService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')
const { cycleEndDate, cycleStartDateByDate } = require('../../../lib/dates.lib.js')

/**
 * Given a licence reference and a date this service voids the return logs from that date forward.
 *
 * @param {string} licenceReference - the reference whose return logs to void
 * @param {string} date - the date from which to void return logs - YYYY-MM-DD
 */
async function go (licenceReference, date) {
  const _date = new Date(date)
  let allYearReturnLogs = []
  let summerReturnLogs = []
  console.log('here')
  console.log('cycleEndDate(true) ' + cycleEndDate(true))
  console.log('cycleEndDate(false) ' + cycleEndDate(false))
  console.log('_date ' + _date)


  if (_date <= cycleEndDate(true)) {
    console.log(_date <= cycleEndDate(true))
    try {
      summerReturnLogs = await _fetchReturnLogs(licenceReference, _date, true)
    } catch (err) {
      console.log(err)
    }
    console.log(summerReturnLogs)
  }

  if (_date <= cycleEndDate(false)) {
    allYearReturnLogs = await _fetchReturnLogs(licenceReference, _date, false)
  }
  console.log(allYearReturnLogs)
  console.log(summerReturnLogs)
  console.log([...allYearReturnLogs, ...summerReturnLogs])


  await _voidReturnLogs([...allYearReturnLogs, ...summerReturnLogs])
}

async function _fetchReturnLogs (licenceReference, date, summer) {
  const cycleStartDate = cycleStartDateByDate(date, summer)
  console.log('cycleStartDate ' + cycleStartDate)

  return ReturnLogModel.query()
    .select(['returnLogs.id'])
    .innerJoinRelated('returnCycle')
    .where('returnLogs.licenceRef', licenceReference)
    .where('returnLogs.startDate', '>=', cycleStartDate)
    .where('returnCycle.summer', summer)
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
