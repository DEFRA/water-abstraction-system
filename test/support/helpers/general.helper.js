'use strict'

/**
 * General helper functions available to all helpers
 * @module GeneralHelper
 */

/**
 * Determine the start and end date for the current financial year
 *
 * For testing purposes we often need to work out what the start and end date for the current financial year is. But
 * because the financial year starts on 01-APR and finishes on 31-MAR what that year is will change dependent on the
 * current date.
 *
 * @returns {Object} An object containing a `startDate` and `endDate`
 */
function currentFinancialYear () {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()

  let startYear
  let endYear

  // IMPORTANT! getMonth returns an integer (0-11). So, January is represented as 0 and December as 11. This is why
  // we use 2 rather than 3 to refer to March
  if (currentDate.getMonth() <= 2) {
    // For example, if currentDate was 2022-02-15 it would fall in financial year 2021-04-01 to 2022-03-31
    startYear = currentYear - 1
    endYear = currentYear
  } else {
    // For example, if currentDate was 2022-06-15 it would fall in financial year 2022-04-01 to 2023-03-31
    startYear = currentYear
    endYear = currentYear + 1
  }

  return { startDate: new Date(startYear, 3, 1), endDate: new Date(endYear, 2, 31) }
}

/**
 * Generate a random integer within a range (inclusive)
 *
 * @param {Number} min lowest number (integer) in the range (inclusive)
 * @param {Number} max largest number (integer) in the range (inclusive)
 *
 * Credit https://stackoverflow.com/a/7228322
 *
 * @returns a number between min and max (inclusive)
 */
function randomInteger (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = {
  currentFinancialYear,
  randomInteger
}
