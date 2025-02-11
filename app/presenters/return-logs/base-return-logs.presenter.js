'use strict'

const { formatNumber, sentenceCase } = require('../base.presenter.js')
const { returnRequirementFrequencies, returnUnits, unitNames } = require('../../lib/static-lookups.lib.js')

/**
 * Formats the details of a return submission meter
 *
 * @param {object} meter - the meter to be formatted
 *
 * @returns {object|null} The formatted meter or null if the meter is null or undefined
 */
function formatMeterDetails(meter) {
  if (!meter || !meter?.manufacturer) {
    return null
  }

  const { manufacturer: make, multiplier, serialNumber } = meter

  return {
    make,
    serialNumber,
    xDisplay: multiplier === 1 ? 'No' : 'Yes'
  }
}

/**
 * Converts a quantity from a given unit to cubic metres and formats it
 *
 * @param {string} units - the unit of the quantity
 * @param {number} quantity - the quantity to be formatted
 *
 * @returns {string|null} The formatted quantity or null if the quantity is null or undefined
 */
function formatQuantity(units, quantity) {
  if (!quantity) {
    return null
  }

  const convertedQuantity = quantity * returnUnits[units].multiplier

  return formatNumber(convertedQuantity)
}

/**
 * Formats the status for a return log, adjusting for specific conditions.
 *
 * If the return log's status is 'completed', it will be displayed as 'complete'. If the status is 'due' and the due
 * date has passed, it will be displayed as 'overdue'. For all other cases, it will return the status as is.
 *
 * @param {module:ReturnLogModel} returnLog - The return log containing status and due date information
 *
 * @returns {string} The formatted status for display.
 */
function formatStatus(returnLog) {
  const { status, dueDate } = returnLog

  // If the return is completed we are required to display it as 'complete'. This also takes priority over the other
  // statues
  if (status === 'completed') {
    return 'complete'
  }

  // Work out if the return is overdue (status is still 'due' and it is past the due date)
  const today = new Date()

  // The due date held in the record is date-only. If we compared it against 'today' without this step any return due
  // 'today' would be flagged as overdue when it is still due (just!)
  today.setHours(0, 0, 0, 0)

  if (status === 'due' && dueDate < today) {
    return 'overdue'
  }

  // For all other cases we can just return the status and the return-status-tag macro will know how to display it
  return status
}

/**
 * Generates the table headers for a return log monthly summary table
 *
 * @param {string} method - whether the submission used abstraction volumes or readings
 * @param {string} frequency - the reporting frequency of the return log
 * @param {string} units - the units used for the return log's selected return submission
 *
 * @returns {object[]} The table headers for the summary table
 */
function generateSummaryTableHeaders(method, frequency, units) {
  const headers = [{ text: 'Month' }]

  if (method !== 'abstractionVolumes') {
    const readingHeading = frequency === 'month' ? 'Reading' : 'End reading'

    headers.push({ text: readingHeading, format: 'numeric' })
  }

  const quantityPostfix = frequency === 'month' ? '' : 'Total '

  if (units !== unitNames.CUBIC_METRES) {
    headers.push({ text: sentenceCase(`${quantityPostfix}${returnUnits[units].label}`), format: 'numeric' })
  }

  headers.push({ text: sentenceCase(`${quantityPostfix}cubic metres`), format: 'numeric' })

  if (frequency !== 'month') {
    headers.push({ text: 'Details', format: 'numeric' })
  }

  return headers
}

/**
 * Generates the table rows for a return log monthly summary table
 *
 * When viewing a return log, or reviewing a return submission on its `/check` page, we are expected to display a
 * monthly summary.
 *
 * For example, if a return log is 'daily', for each month it covers we are required to summarise the daily line entries
 * into a single 'monthly summary'.
 *
 * But there are a number of things we have to take into account
 *
 * - if the user did not enter anything, the line's quantity will be null and not 0
 * - the total quantity for a month can also be null (no quantities were entered)
 * - if readings instead of abstraction volumes were used, we have to find the last reading for the month
 * - if the frequency is daily or weekly, we have to generate links to view the line details for each month
 * - if the submission does not use cubic metres, we also have to convert the monthly quantity into the selected unit
 *
 * So, we use `_groupLinesByMonth()` to group the lines by month. For each month the return log covers, a group will be
 * generated. This includes summing the quantity and determining the last meter reading. Then we iterate through the
 * groups to generate the table rows to be used in the views.
 *
 * @param {string} method - Indicates if the submission used abstraction volumes or readings.
 * @param {string} frequency - The reporting frequency of the return log.
 * @param {object[]} lines - The individual submission lines to be grouped and formatted into table rows
 * @param {string} [id=null] - The ID to use in the link to view the daily/weekly details for a month
 * @param {string} [rootPath='/system/return-submissions'] - The base path for generating links to view details
 *
 * @returns {object[]} An array of row data objects for the summary table, each containing details like month, total
 * quantity, reading, and unit totals.
 */
function generateSummaryTableRows(method, frequency, lines, id = null, rootPath = '/system/return-submissions') {
  const groups = _groupLinesByMonth(lines)

  return groups.map((group) => {
    const { endDate, quantity, reading, userUnit } = group

    const rowData = {
      month: endDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      monthlyTotal: formatNumber(quantity)
    }

    if (method !== 'abstractionVolumes') {
      rowData.reading = reading
    }

    if (frequency !== 'month') {
      rowData.link = _linkDetails(id, method, frequency, endDate, rootPath)
    }

    if (userUnit !== unitNames.CUBIC_METRES) {
      rowData.unitTotal = formatQuantity(userUnit, quantity)
    }

    return rowData
  })
}

/**
 * Fortunately, each line has a start and end date based on the return log's frequency. For example, if the frequency is
 * daily, the start and end dates will be the same. If the frequency is monthly, the start and end dates will be the
 * first and last day of the month.
 *
 * If the frequency is weekly, the start and end dates will be the first (Sunday) and last (Saturday) day of the week.
 *
 * For each line we extract the end date and use it to generate a 'key'. We use the end date because for the purposes of
 * return submissions, it is the end date that governs when the water was abstracted.
 *
 * For example, if the line was for week commencing Sunday 30 March 2025, then the end date will be Saturday 5 April.
 * This means water will be deemed to have been extracted in April 2025, not March.
 *
 * > Daily and monthly are simple, because the start and end date is always in the same month!
 *
 * The key is formed from the year and month of the end date. We iterate the lines, generating the key and checking if
 * we already have a group with the matching key. If we do, we add to its quantity. Else, we create a new group,
 * assigning the end date, user unit, and initial quantity ready for the next step, where we format each group as a
 * summary row for the table.
 *
 * The final step is to check if a reading has been entered by a user. If it has we assign that to the group,
 * overwriting whatever entry was previously captured. In this way when we move to the next group, we'll know we have
 * captured the 'end reading' for the month.
 *
 * @private
 */
function _groupLinesByMonth(lines) {
  const groupedLines = lines.reduce((acc, line) => {
    const { endDate, quantity, reading, userUnit } = line
    const key = `${endDate.getFullYear()}-${endDate.getMonth()}`

    if (!acc[key]) {
      acc[key] = {
        endDate,
        quantity: 0,
        userUnit
      }
    }
    acc[key].quantity += quantity

    if (reading) {
      acc[key].reading = reading
    }

    return acc
  }, {})

  return Object.values(groupedLines)
}

function _linkDetails(id, method, frequency, endDate, rootPath) {
  const linkTextMethod = method === 'abstractionVolumes' ? 'volumes' : 'readings'
  const text = `View ${returnRequirementFrequencies[frequency]} ${linkTextMethod}`
  const yearMonth = `${endDate.getFullYear()}-${endDate.getMonth()}`

  return {
    href: `${rootPath}/${id}/${yearMonth}`,
    text
  }
}

module.exports = {
  formatMeterDetails,
  formatQuantity,
  formatStatus,
  generateSummaryTableHeaders,
  generateSummaryTableRows
}
