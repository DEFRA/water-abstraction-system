'use strict'

/**
 * General helper methods
 * @module DatesLib
 */

const { returnCycleDates } = require('./static-lookups.lib.js')
const { formatDateObjectToISO } = require('./dates.lib.js')

/**
 * Get the due date of next provided cycle, either summer or winter and all year, formatted as YYYY-MM-DD
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {string} - the due date of the next cycle as an ISO string.
 */
function cycleDueDateAsISO (summer) {
  return formatDateObjectToISO(cycleDueDate(summer))
}

/**
 * Get the due date of next provided cycle, either summer or winter and all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {Date} - the due date of the next cycle.
 */
function cycleDueDate (summer) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  if (summer) {
    if (month > returnCycleDates.summer.endDate.month) {
      return new Date(year + 1, returnCycleDates.summer.dueDate.month, returnCycleDates.summer.dueDate.day)
    }

    return new Date(year, returnCycleDates.summer.dueDate.month, returnCycleDates.summer.dueDate.day)
  }

  if (month > returnCycleDates.allYear.endDate.month) {
    return new Date(year + 1, returnCycleDates.allYear.dueDate.month, returnCycleDates.allYear.dueDate.day)
  }

  return new Date(year, returnCycleDates.allYear.dueDate.month, returnCycleDates.allYear.dueDate.day)
}

/**
 * Given an arbitary date and if it is summer or all-year return the due date of that cycle
 *
 * @param {Date} date - the date whose due date you want to find.
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {string} - the due date of the next cycle.
 */
function cycleDueDateByDate (date, summer) {
  const year = date.getFullYear()
  const month = date.getMonth()

  if (summer) {
    if (month > returnCycleDates.summer.endDate.month) {
      return formatDateObjectToISO(new Date(`${year + 1}-${returnCycleDates.summer.dueDate.month + 1}-${returnCycleDates.summer.dueDate.day}`))
    }

    return formatDateObjectToISO(new Date(`${year}-${returnCycleDates.summer.dueDate.month + 1}-${returnCycleDates.summer.dueDate.day}`))
  }

  if (month > returnCycleDates.allYear.endDate.month) {
    return formatDateObjectToISO(new Date(`${year + 1}-${returnCycleDates.allYear.dueDate.month + 1}-${returnCycleDates.allYear.dueDate.day}`))
  }

  return formatDateObjectToISO(new Date(`${year}-${returnCycleDates.allYear.dueDate.month + 1}-${returnCycleDates.allYear.dueDate.day}`))
}

/**
 * Get the end date of next provided cycle, either summer or winter and all year, formatted as YYYY-MM-DD
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {string} - the end date of the next cycle as an ISO string.
 */
function cycleEndDateAsISO (summer) {
  return formatDateObjectToISO(cycleEndDate(summer))
}

/**
 * Get the end date of next provided cycle, either summer and winter or all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {Date} - the end date of the next cycle.
 */
function cycleEndDate (summer) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  if (summer) {
    if (month > returnCycleDates.summer.endDate.month) {
      return new Date(year + 1, returnCycleDates.summer.endDate.month, returnCycleDates.summer.endDate.day)
    }

    return new Date(year, returnCycleDates.summer.endDate.month, returnCycleDates.summer.endDate.day)
  }

  if (month > returnCycleDates.allYear.endDate.month) {
    return new Date(year + 1, returnCycleDates.allYear.endDate.month, returnCycleDates.allYear.endDate.day)
  }

  return new Date(year, returnCycleDates.allYear.endDate.month, returnCycleDates.allYear.endDate.day)
}

/**
 * Given an arbitary date and if it is summer or all-year return the end date of that cycle
 *
 * @param {Date} date - the date whose start date you want to find.
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {Date} - the start date of the next cycle.
 */
function cycleEndDateByDate (date, summer) {
  const year = date.getFullYear()
  const month = date.getMonth()

  if (summer) {
    if (month > returnCycleDates.summer.endDate.month) {
      return formatDateObjectToISO(new Date(`${year + 1}-${returnCycleDates.summer.endDate.month + 1}-${returnCycleDates.summer.endDate.day}`))
    }

    return formatDateObjectToISO(new Date(`${year}-${returnCycleDates.summer.endDate.month + 1}-${returnCycleDates.summer.endDate.day}`))
  }

  if (month > returnCycleDates.allYear.endDate.month) {
    return formatDateObjectToISO(new Date(`${year + 1}-${returnCycleDates.allYear.endDate.month + 1}-${returnCycleDates.allYear.endDate.day}`))
  }

  return formatDateObjectToISO(new Date(`${year}-${returnCycleDates.allYear.endDate.month + 1}-${returnCycleDates.allYear.endDate.day}`))
}

/**
 * Get the start date of next provided cycle, either summer and winter and all year, formatted as YYYY-MM-DD
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {string} - the start date of the next cycle as an ISO string.
 */
function cycleStartDateAsISO (summer) {
  return formatDateObjectToISO(cycleStartDate(summer))
}

/**
 * Get the start date of next provided cycle, either summer or winter and all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {Date} - the start date of the next cycle.
 */
function cycleStartDate (summer) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  if (summer) {
    if (month < returnCycleDates.summer.startDate.month) {
      return new Date(year - 1, returnCycleDates.summer.startDate.month, returnCycleDates.summer.startDate.day)
    }

    return new Date(year, returnCycleDates.summer.startDate.month, returnCycleDates.summer.startDate.day)
  }

  if (month < returnCycleDates.allYear.startDate.month) {
    return new Date(year - 1, returnCycleDates.allYear.startDate.month, returnCycleDates.allYear.startDate.day)
  }

  return new Date(year, returnCycleDates.allYear.startDate.month, returnCycleDates.allYear.startDate.day)
}

/**
 * Given an arbitary date and if it is summer or all-year return the start date of that cycle
 *
 * @param {Date} date - the date whose start date you want to find.
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {Date} - the start date of the next cycle.
 */
function cycleStartDateByDate (date, summer) {
  const year = date.getFullYear()
  const month = date.getMonth()

  if (summer) {
    if (month < returnCycleDates.summer.startDate.month) {
      return formatDateObjectToISO(new Date(`${year - 1}-${returnCycleDates.summer.startDate.month + 1}-${returnCycleDates.summer.startDate.day}`))
    }

    return formatDateObjectToISO(new Date(`${year}-${returnCycleDates.summer.startDate.month + 1}-${returnCycleDates.summer.startDate.day}`))
  }

  if (month < returnCycleDates.allYear.startDate.month) {
    return formatDateObjectToISO(new Date(`${year - 1}-${returnCycleDates.allYear.startDate.month + 1}-${returnCycleDates.allYear.startDate.day}`))
  }

  return formatDateObjectToISO(new Date(`${year}-${returnCycleDates.allYear.startDate.month + 1}-${returnCycleDates.allYear.startDate.day}`))
}

module.exports = {
  cycleDueDate,
  cycleDueDateByDate,
  cycleDueDateAsISO,
  cycleEndDate,
  cycleEndDateByDate,
  cycleEndDateAsISO,
  cycleStartDate,
  cycleStartDateByDate,
  cycleStartDateAsISO
}
