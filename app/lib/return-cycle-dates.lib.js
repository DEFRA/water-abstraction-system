'use strict'

/**
 * Helper methods to deal with return cycle dates
 * @module ReturnCycleDatesLib
 */

const { returnCycleDates } = require('./static-lookups.lib.js')

/**
 * Determine the due date of next provided cycle, either summer or winter and all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year
 * @param {Date} [determinationDate] - the date by which to determine the cycle's 'due date' (defaults to current date)
 *
 * @returns {Date} the due date of the next cycle
 */
function determineCycleDueDate(summer, determinationDate = new Date()) {
  if (summer) {
    return _dueDate(determinationDate, returnCycleDates.summer)
  }

  return _dueDate(determinationDate, returnCycleDates.allYear)
}

/**
 * Determine the end date of next provided cycle, either summer and winter or all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year
 * @param {Date} [determinationDate] - the date by which to determine the cycle's 'end date' (defaults to current date)
 *
 * @returns {Date} the end date of the next cycle
 */
function determineCycleEndDate(summer, determinationDate = new Date()) {
  if (summer) {
    return _endDate(determinationDate, returnCycleDates.summer)
  }

  return _endDate(determinationDate, returnCycleDates.allYear)
}

/**
 * Determine the start date of next provided cycle, either summer or winter and all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year
 * @param {Date} [determinationDate] - the date by which to determine the cycle's 'start date' (defaults to current
 * date)
 *
 * @returns {Date} the start date of the next cycle.
 */
function determineCycleStartDate(summer, determinationDate = new Date()) {
  if (summer) {
    return _startDate(determinationDate, returnCycleDates.summer)
  }

  return _startDate(determinationDate, returnCycleDates.allYear)
}

function _dueDate(determinationDate, cycle) {
  const year = determinationDate.getFullYear()
  const month = determinationDate.getMonth()

  const cycleDueDay = cycle.dueDate.day
  const cycleDueMonth = cycle.dueDate.month + 1
  const cycleDueYear = month > cycle.endDate.month ? year + 1 : year

  return new Date(`${cycleDueYear}-${cycleDueMonth}-${cycleDueDay}`)
}

function _endDate(determinationDate, cycle) {
  const year = determinationDate.getFullYear()
  const month = determinationDate.getMonth()

  const cycleEndDay = cycle.endDate.day
  const cycleEndMonth = cycle.endDate.month + 1
  const cycleEndYear = month > cycle.endDate.month ? year + 1 : year

  return new Date(`${cycleEndYear}-${cycleEndMonth}-${cycleEndDay}`)
}

function _startDate(determinationDate, cycle) {
  const year = determinationDate.getFullYear()
  const month = determinationDate.getMonth()

  const cycleStartDay = cycle.startDate.day
  const cycleStartMonth = cycle.startDate.month + 1
  const cycleStartYear = month < cycle.startDate.month ? year - 1 : year

  return new Date(`${cycleStartYear}-${cycleStartMonth}-${cycleStartDay}`)
}

module.exports = {
  determineCycleDueDate,
  determineCycleEndDate,
  determineCycleStartDate
}
