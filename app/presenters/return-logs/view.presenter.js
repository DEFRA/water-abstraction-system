'use strict'

/**
 * TODO: Document
 * @module ReturnLogPresenter
 */

const { formatAbstractionPeriod } = require('../base.presenter.js')

/**
 * TODO: Document
 * @param data
 */
function go(data) {
  const dataString = JSON.stringify(data, null, 2)

  const tableRows = _formatRows(data.lines)
  const description = data.metadata.description
  const returnPeriod = _formatReturnPeriod(data.startDate, data.endDate)

  const { periodStartDay, periodStartMonth, periodEndDay, periodEndMonth } = data.metadata.nald
  const abstractionPeriod = formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth)

  const purposes = _formatPurposes(data.metadata.purposes)

  return { dataString, tableRows, description, purposes, returnPeriod, abstractionPeriod }
}

function _formatRows(lines) {
  return lines.map((line) => {
    // TODO: Confirm how to handle dates, eg. do we assume that start_date and end_date are interchangeable or do we use
    // a specific one? And do we just take year and month, so that eg. 05/12/2024 and 31/12/2024 are the same?
    const date = _formatDateMonthYear(line.endDate)
    const quantity = line.quantity
    const details = 'View daily volumes'

    return [{ text: date }, { text: quantity }, { text: details }]
  })
}

function _formatPurposes(purposes) {
  return purposes.map((purpose) => {
    return purpose.alias || purpose.tertiary.description
  })
}

function _formatReturnPeriod(startDate, endDate) {
  const formattedStartDate = _formatDateDayMonthYear(startDate)
  const formattedEndDate = _formatDateDayMonthYear(endDate)

  return `${formattedStartDate} to ${formattedEndDate}`
}

function _formatDateDayMonthYear(date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
}

function _formatDateMonthYear(date) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
}

module.exports = {
  go
}
