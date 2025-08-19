'use strict'

/**
 * Formats data for the return form
 * @module PrepareReturnFormsPresenter
 */

const NotifyAddressPresenter = require('./notify-address.presenter.js')
const { formatLongDate } = require('../../base.presenter.js')
const { naldAreaCodes, returnRequirementFrequencies } = require('../../../lib/static-lookups.lib.js')
const { splitArrayIntoGroups } = require('../../../lib/general.lib.js')
const { weeksFromPeriod, monthsFromPeriod } = require('../../../lib/dates.lib.js')

const RETURN_TYPE = {
  week: {
    columns: 2,
    columnSize: 14
  },
  month: {
    columns: 2,
    columnSize: 12
  },
  day: {
    columns: 3,
    columnSize: 1
  }
}

/**
 * Formats data for the return form
 *
 * The return form has multiple pages and some complex logic / data.
 *
 * Each page will be assigned a corresponding object to isolate the data to each page where possible. Those pages are:
 * - The "cover" page, this is the first page. The address is on this page.
 *
 * @param {SessionModel} session - The session instance
 * @param {object} dueReturnLog
 * @param {object} recipient
 *
 * @returns {object} - The data formatted for the return form
 */
function go(session, dueReturnLog, recipient) {
  const { licenceRef } = session

  const {
    dueDate,
    endDate,
    naldAreaCode,
    purpose,
    regionName,
    returnsFrequency,
    returnReference,
    siteDescription,
    startDate,
    twoPartTariff
  } = dueReturnLog

  return {
    address: _address(recipient),
    dueDate: formatLongDate(new Date(dueDate)),
    endDate: formatLongDate(new Date(endDate)),
    licenceRef,
    meterReadings: _meterReadings(startDate, endDate, returnsFrequency),
    pageTitle: _pageTitle(returnsFrequency),
    purpose,
    regionAndArea: _regionAndArea(regionName, naldAreaCode),
    returnReference,
    returnsFrequency,
    siteDescription,
    startDate: formatLongDate(new Date(startDate)),
    twoPartTariff
  }
}

function _address(recipient) {
  return NotifyAddressPresenter.go(recipient.contact)
}

/**
 * Splits a list of page items into up to columns.
 *
 * If the number of items exceeds the specified `columnSize`, the overflow
 * is placed in the second column. If there are fewer items than `columnSize`,
 * the second column will be empty.
 *
 * The page layout will roughly be:
 *
 * | Column 1 | Column 2 |
 * | -------- | -------- |
 * | item 1 | item 3 |
 * | item 2 | item 4 |
 *
 * @private
 */
function _columns(pageItems, columnSize) {
  const [firstColumn, secondColumn] = splitArrayIntoGroups(pageItems, columnSize)

  return [firstColumn || [], secondColumn || []]
}

function _formatPeriodsToLongDate(periods) {
  return periods.map((period) => {
    return formatLongDate(new Date(period.endDate))
  })
}

/**
 * The legacy code accounts for the 'nald.areaCode' not being set in the metadata. This logic replicates the legacy
 * logic.
 *
 * @private
 */
function _regionAndArea(regionName, naldAreaCode) {
  if (naldAreaCode) {
    return `${regionName} / ${naldAreaCodes[naldAreaCode]}`
  }

  return regionName
}

function _meterReadings(startDate, endDate, returnsFrequency) {
  const { columns, columnSize } = RETURN_TYPE[returnsFrequency]

  const dates = _generateDates(startDate, endDate, returnsFrequency)

  const totalItemsPerPage = columnSize * columns

  return _paginate(dates, totalItemsPerPage, columnSize)
}

/**
 * The meter readings use boxes to allow the user to fill in the reading.
 *
 * These boxes can span multiple pages, we need to handle this use case.
 *
 * We first format the array of dates into groups suitable to render on the page.
 *
 * In the case of a 'week' we want to have 2 columns with 14 'cells' per column. This means 28 total dates on the page.
 * When this limit is exceeded, we continue onto the next page. Therefore, given 65 dates, we would get 3 groups in our
 * array:
 * - The first page would be an array of 28
 * - The second page would be an array of 28
 * - The third page would be an array of 8
 *
 * Total = 65 dates.
 *
 * Once the page count has been established, we need to format the dates into columns per page. This 'week' example of 2
 * columns and 14 'cells' would result in two columns with 14 'cells' in each column.
 *
 * When the column does not reach the maximum row count, it will fill the cells with the remaining dates (if any).
 *
 * This is driven from the UI where the columns are determined by the layout. It is expected to only have one column in
 * cases where the 'returnsFrequency' is months.
 *
 * @private
 */
function _paginate(dates, perPage, columnSize) {
  const pageChunks = splitArrayIntoGroups(dates, perPage)

  return pageChunks.map((pageItems) => {
    return _columns(pageItems, columnSize)
  })
}

function _pageTitle(returnsFrequency) {
  return `Water abstraction ${returnRequirementFrequencies[returnsFrequency]} return`
}

function _generateDates(startDate, endDate, returnsFrequency) {
  const periodStartDate = new Date(startDate)
  const periodEndDate = new Date(endDate)

  let dates = []

  if (returnsFrequency === 'week') {
    dates = weeksFromPeriod(periodStartDate, periodEndDate)
  } else if (returnsFrequency === 'month') {
    dates = monthsFromPeriod(periodStartDate, periodEndDate)
  }

  return _formatPeriodsToLongDate(dates)
}

module.exports = {
  go
}
