'use strict'

/**
 * Determines if a licence's 'end dates' have changed, and if more than one has, which was the earliest
 * @module DetermineEarliestLicenceChangedDateService
 */

const { compareDates, datesMatch, determineEarliestDate } = require('../../../lib/dates.lib.js')

/**
 * Determines if a licence's 'end dates' have changed, and if more than one has, which was the earliest
 *
 * We need to know two things for each licence we process in the job.
 *
 * - has _any_ 'end date' changed?
 * - if more than one has changed, which was the earliest?
 *
 * The answer to the first question determines if we bother to process the licence at all. If nothing has changed, we
 * can skip the licence and move on to the next one.
 *
 * If something has changed, those downstream services will need to know what the 'change date' was.
 *
 * When it comes to determining the 'change date', we should always come back to a date, because if both were null then
 * there would not be a change!
 *
 * - when the NALD date is less than WRLS; `changeDate` = `naldDate`
 * - when the NALD date is greater than WRLS; `changeDate` = `wrlsDate`
 * - else `changeDate` is whichever date is populated
 *
 * On that last example, if the NALD date is null (a user has unset it), then the 'change date' is whatever we have in
 * WRLS. We are effectively saying, whatever decisions we made about the licence from 'x', are now open to change
 * because it is no longer 'ended'.
 *
 * @param {object} licence - The licence object containing NALD and WRLS details to check for changed dates
 *
 * @returns {object|null} The earliest changed date if any changes are found, otherwise null
 */
function go(licence) {
  const changedDates = _changedDates(licence)

  if (changedDates.length === 0) {
    return null
  }

  return _earliestChangedDate(changedDates)
}

/**
 * Handles the complexity of comparing dates and then determining what the 'change date' is
 *
 * @private
 */
function _changedDate(dateType, naldDate, wrlsDate) {
  if (datesMatch(naldDate, wrlsDate)) {
    return null
  }

  const changeDate = determineEarliestDate([naldDate, wrlsDate])

  return { changeDate, dateType, naldDate, wrlsDate }
}

function _changedDates(licence) {
  const {
    nald_expired_date: naldExpiredDate,
    nald_lapsed_date: naldLapsedDate,
    nald_revoked_date: naldRevokedDate,
    wrls_expired_date: wrlsExpiredDate,
    wrls_lapsed_date: wrlsLapsedDate,
    wrls_revoked_date: wrlsRevokedDate
  } = licence
  const changedDates = []

  // Expired
  let changedDate = _changedDate('expired', naldExpiredDate, wrlsExpiredDate)
  if (changedDate) {
    changedDates.push(changedDate)
  }

  // Lapsed
  changedDate = _changedDate('lapsed', naldLapsedDate, wrlsLapsedDate)
  if (changedDate) {
    changedDates.push(changedDate)
  }

  // Revoked
  changedDate = _changedDate('revoked', naldRevokedDate, wrlsRevokedDate)
  if (changedDate) {
    changedDates.push(changedDate)
  }

  return changedDates
}

function _earliestChangedDate(changedDates) {
  // NOTE: sort() sorts the elements 'in place'
  changedDates.sort((changedDateA, changedDateB) => {
    return compareDates(changedDateA.changeDate, changedDateB.changeDate)
  })

  return changedDates[0]
}

module.exports = {
  go
}
