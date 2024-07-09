'use strict'

// TODO: this will need to use built in date
const moment = require('moment')
// TODO: you might not need lodash...
const { last, omit, isEqual } = require('lodash')

const DATE_FORMAT = 'YYYY-MM-DD'

/**
 * Checks whether 2 objects have adjacent date ranges.
 * Object a must have an endDate that is either null, or 1 day before
 * the startDate property of object b
 * @param {Object} a
 * @param {Object} b next row
 * @return {Boolean}
 */
const isAdjacentDateRange = (a, b) => {
  const expectedEndDate = moment(b.startDate).subtract(1, 'day').format(DATE_FORMAT)

  return [null, expectedEndDate].includes(a.endDate)
}

/**
 * Default implementation of equality test between two objects
 * for history merging.
 * Checks if the objects are equal when taking into account all
 * properties except startDate and endDate
 * @param {Object} a
 * @param {Object} b
 * @return {Boolean}
 */
const equalityTest = (a, b) => {
  const objA = omit(a, ['startDate', 'endDate'])
  const objB = omit(b, ['startDate', 'endDate'])

  return isEqual(objA, objB)
}

/**
 * Given an array of objects sorted by date, de-duplicates them where adjacent array items
 * are identical except for their date ranges, extending the endDate property of
 * earlier element to that of the later element
 * @param {Array} arr - a list of objects, each with startDate and endDate properties
 * @param {Function} func - a function which tests if adjacent objects can be merged
 * @return {Array} an array with histories merged
 */
const mergeHistory = (arr, isEqual = equalityTest) => {
  return arr.reduce((acc, row) => {
    const previousRow = last(acc)

    if (acc.length && isEqual(row, previousRow) && isAdjacentDateRange(previousRow, row)) {
      acc[acc.length - 1] = {
        ...previousRow,
        endDate: row.endDate
      }
    } else {
      acc.push(row)
    }

    return acc
  }, [])
}

exports.mergeHistory = mergeHistory
