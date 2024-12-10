'use strict'

/**
 * TODO: Document
 * @module ReturnLogPresenter
 */

const { formatAbstractionPeriod, formatLongDate, titleCase } = require('../base.presenter.js')

/**
 * TODO: Document
 * @param data
 */
function go(data) {
  const dataString = JSON.stringify(data, null, 2)

  const { licenceNumber, status } = data

  const tableRows = _formatRows(data.lines)
  const description = data.metadata.description
  const returnPeriod = _formatReturnPeriod(data.startDate, data.endDate)

  const { periodStartDay, periodStartMonth, periodEndDay, periodEndMonth } = data.metadata.nald
  const abstractionPeriod = formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth)

  const returnPurpose = _formatReturnPurpose(data.metadata.purposes)

  const purposes = _formatPurposes(data.metadata.purposes)

  return {
    dataString,
    abstractionPeriod,
    description,
    licenceNumber,
    purposes,
    returnPeriod,
    returnPurpose,
    status,
    tableRows
  }
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
  const formattedStartDate = formatLongDate(new Date(startDate))
  const formattedEndDate = formatLongDate(new Date(endDate))

  return `${formattedStartDate} to ${formattedEndDate}`
}

function _formatReturnPurpose(purposes) {
  return purposes
    .map((purpose) => {
      const purposeToDisplay = purpose.alias || purpose.tertiary.description
      // titleCase
      return titleCase(purposeToDisplay)
    })
    .join(', ')
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
