'use strict'

/**
 * Formats data for the return form
 * @module PrepareReturnFormsPresenter
 */

const { daysFromPeriod, monthsFromPeriod, weeksFromPeriod } = require('../../../lib/dates.lib.js')
const { formatLongDate } = require('../../base.presenter.js')
const { futureDueDate } = require('../base.presenter.js')
const { naldAreaCodes, returnRequirementFrequencies } = require('../../../lib/static-lookups.lib.js')
const { splitArrayIntoGroups } = require('../../../lib/general.lib.js')

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
    columns: 3
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
 * This presenter is also used to supply the data for the saved notifications, this has its own presenter which maps
 * some of these keys to 'snake case'. So there is additional data in the response which may not be in the PDF file.
 *
 * @param {object} notification - A paper from notification
 *
 * @returns {object} - The data formatted for the return form
 */
function go(notification) {
  const {
    personalisation: {
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      address_line_3: addressLine3,
      address_line_4: addressLine4,
      address_line_5: addressLine5,
      address_line_6: addressLine6,
      address_line_7: addressLine7,
      due_date: dueDate,
      end_date: endDate,
      format_id: returnReference,
      is_two_part_tariff: twoPartTariff,
      licence_ref: licenceRef,
      naldAreaCode,
      purpose,
      qr_url: returnLogId,
      region_code: regionCode,
      region_name: regionName,
      returns_frequency: returnsFrequency,
      site_description: siteDescription,
      start_date: startDate
    },
    returnLogIds
  } = notification

  const [returnId] = returnLogIds

  return {
    address: {
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      address_line_3: addressLine3,
      address_line_4: addressLine4,
      address_line_5: addressLine5,
      address_line_6: addressLine6,
      address_line_7: addressLine7
    },
    licenceRef,
    naldAreaCode,
    pageEntries: _entries(startDate, endDate, returnsFrequency),
    pageTitle: _pageTitle(returnsFrequency),
    purpose,
    regionAndArea: _regionAndArea(regionName, naldAreaCode),
    regionCode,
    returnId,
    returnLogId,
    returnReference,
    returnsFrequency,
    siteDescription,
    twoPartTariff,
    ..._dates(dueDate, endDate, startDate)
  }
}

function _dates(dueDate, endDate, startDate) {
  return {
    dueDate: formatLongDate(dueDate) || formatLongDate(futureDueDate('letter')),
    endDate: formatLongDate(endDate),
    startDate: formatLongDate(startDate)
  }
}

/**
 * Day entries are structured differently to 'month' and 'week'
 *
 * The 'days' will take up three columns per page, with the month and year at the top of each column - 'June 2024'
 * and with the day next to the checkbox. It will look something like this:
 *
 * ```
 * June 2024                July 2024                 August 2024
 *
 * 1 [][][][][][][][][][]   1 [][][][][][][][][][]    1 [][][][][][][][][][]
 * 2 [][][][][][][][][][]   2 [][][][][][][][][][]    2 [][][][][][][][][][]
 * 3 [][][][][][][][][][]   3 [][][][][][][][][][]    3 [][][][][][][][][][]
 * ```
 *
 * @private
 */
function _dayEntries(startDate, endDate) {
  const periodStartDate = new Date(startDate)
  const periodEndDate = new Date(endDate)

  const periodDates = daysFromPeriod(periodStartDate, periodEndDate)

  const dates = periodDates.map((date) => {
    return new Date(date.endDate)
  })

  const groupedDates = _groupDaysIntoMonths(dates)

  return splitArrayIntoGroups(groupedDates, RETURN_TYPE.day.columns)
}

/**
 * Splits a list of page items into up to columns
 *
 * If the number of items exceeds the specified `columnSize`, the overflow is placed in the second column. If there are
 * fewer items than `columnSize`, the second column will be empty.
 *
 * The page layout will roughly be:
 *
 * | Column 1 | Column 2 |
 * | -------- | -------- |
 * | item 1   | item 3   |
 * | item 2   | item 4   |
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
 * Group an array of dates by the date's month and year.
 *
 * The group key (period) will be the month and the year of the date 'June 2024'.
 *
 * The date will be added to the 'days' array for the group as the day only (no leading 0).
 *
 * @private
 */
function _groupDaysIntoMonths(dates) {
  return dates.reduce((acc, date) => {
    const key = date.toLocaleString('default', { month: 'long', year: 'numeric' })

    let group = acc.find((existingGroup) => {
      return existingGroup.period === key
    })

    if (!group) {
      group = {
        period: key,
        days: []
      }
      acc.push(group)
    }

    group.days.push(date.getDate())

    return acc
  }, [])
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

function _entries(startDate, endDate, returnsFrequency) {
  if (returnsFrequency === 'day') {
    return _dayEntries(startDate, endDate)
  }

  const { columns, columnSize } = RETURN_TYPE[returnsFrequency]

  const dates = _generateDates(startDate, endDate, returnsFrequency)

  const totalItemsPerPage = columnSize * columns

  return _paginate(dates, totalItemsPerPage, columnSize)
}

/**
 * The entries use boxes to allow the user to fill in the number.
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
  }

  if (returnsFrequency === 'month') {
    dates = monthsFromPeriod(periodStartDate, periodEndDate)
  }

  return _formatPeriodsToLongDate(dates)
}

module.exports = {
  go
}
