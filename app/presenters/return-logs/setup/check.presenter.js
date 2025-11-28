'use strict'

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/check` page
 * @module CheckPresenter
 */

const Big = require('big.js')

const { formatAbstractionPeriod, formatLongDate, formatNumber, sentenceCase } = require('../../base.presenter.js')
const { generateSummaryTableHeaders } = require('../base-return-logs.presenter.js')
const { returnRequirementFrequencies } = require('../../../lib/static-lookups.lib.js')

const ABSTRACTION_VOLUMES_METHOD = 'abstractionVolumes'

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/check` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} page data needed for the `/return-logs/setup/{sessionId}/check` page
 */
function go(session) {
  const alwaysRequiredPageData = _alwaysRequiredPageData(session)

  if (session.journey === 'nilReturn') {
    return alwaysRequiredPageData
  }

  const {
    lines,
    meter10TimesDisplay,
    meterMake,
    meterProvided,
    meterSerialNumber,
    reported,
    returnsFrequency,
    startReading,
    units,
    unitSymbol
  } = session
  const formattedLines = _formatLines(lines, reported)

  return {
    ...alwaysRequiredPageData,
    displayReadings: reported !== ABSTRACTION_VOLUMES_METHOD,
    displayUnits: units !== 'cubicMetres',
    enterMultipleLinkText: _enterMultipleLinkText(reported, returnsFrequency),
    meter10TimesDisplay,
    meterMake,
    meterProvided,
    meterSerialNumber,
    reportingFigures: reported === ABSTRACTION_VOLUMES_METHOD ? 'Volumes' : 'Meter readings',
    startReading,
    summaryTableData: _summaryTableData(formattedLines, session, unitSymbol),
    tableTitle: _tableTitle(reported, returnsFrequency),
    totalCubicMetres: _totalCubicMetres(lines),
    totalQuantity: _totalQuantity(lines),
    units: units === 'cubicMetres' ? 'Cubic metres' : sentenceCase(units)
  }
}

function _alwaysRequiredPageData(session) {
  const {
    id: sessionId,
    endDate,
    journey,
    note,
    periodEndDay,
    periodEndMonth,
    periodStartDay,
    periodStartMonth,
    purposes,
    receivedDate,
    returnReference,
    siteDescription,
    startDate,
    twoPartTariff
  } = session

  return {
    abstractionPeriod: formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth),
    links: {
      cancel: `/system/return-logs/setup/${sessionId}/cancel`,
      meterDetails: `/system/return-logs/setup/${sessionId}/meter-provided`,
      multipleEntries: `/system/return-logs/setup/${sessionId}/multiple-entries`,
      nilReturn: `/system/return-logs/setup/${sessionId}/submission`,
      received: `/system/return-logs/setup/${sessionId}/received`,
      reported: `/system/return-logs/setup/${sessionId}/reported`,
      startReading: `/system/return-logs/setup/${sessionId}/start-reading`,
      units: `/system/return-logs/setup/${sessionId}/units`
    },
    nilReturn: journey === 'nilReturn' ? 'Yes' : 'No',
    note: _note(note),
    pageTitle: 'Check details and enter new volumes or readings',
    pageTitleCaption: `Return reference ${returnReference}`,
    purposes: purposes.join(', '),
    returnPeriod: `${formatLongDate(new Date(startDate))} to ${formatLongDate(new Date(endDate))}`,
    returnReceivedDate: formatLongDate(new Date(receivedDate)),
    siteDescription,
    tariff: twoPartTariff ? 'Two-part' : 'Standard'
  }
}

function _enterMultipleLinkText(reported, returnsFrequency) {
  const frequency = returnRequirementFrequencies[returnsFrequency]
  const method = reported === ABSTRACTION_VOLUMES_METHOD ? 'volumes' : 'readings'

  return `Enter multiple ${frequency} ${method}`
}

function _formatLines(lines, reported) {
  return lines.map((line) => {
    const formattedLine = {
      endDate: new Date(line.endDate),
      quantity: line.quantity,
      quantityCubicMetres: line.quantityCubicMetres,
      startDate: new Date(line.startDate)
    }

    if (reported !== ABSTRACTION_VOLUMES_METHOD) {
      formattedLine.reading = line.reading
    }

    return formattedLine
  })
}

/**
 * Groups an array of formatted lines by month.
 *
 * @returns {Array} An array of objects grouped by month, each containing:
 *   @param {Date} endDate - The end date of the month.
 *   @param {number} quantity - The total quantity for the month.
 *   @param {number} quantityCubicMetres - The total quantity in cubic metres for the month.
 *   @param {number} [reading] - The meter reading value for the month (if available). This will always be the last
 * meter reading for the month if readings exist.
 * @private
 */
function _groupLinesByMonth(formattedLines) {
  const groupedLines = formattedLines.reduce((monthlyLine, line) => {
    const { endDate, quantity, quantityCubicMetres, reading } = line
    const key = `${endDate.getFullYear()}-${endDate.getMonth()}`

    if (!monthlyLine[key]) {
      monthlyLine[key] = {
        endDate,
        quantity: 0,
        quantityCubicMetres: 0
      }
    }
    monthlyLine[key].quantity = Big(monthlyLine[key].quantity)
      .plus(quantity ?? 0)
      .toNumber()
    monthlyLine[key].quantityCubicMetres = Big(monthlyLine[key].quantityCubicMetres)
      .plus(quantityCubicMetres ?? 0)
      .toNumber()

    if (typeof reading === 'number') {
      monthlyLine[key].reading = reading
    }

    return monthlyLine
  }, {})

  return Object.values(groupedLines)
}

function _linkDetails(endDate, reported, returnsFrequency, sessionId) {
  const linkTextMethod = reported === ABSTRACTION_VOLUMES_METHOD ? 'volumes' : 'readings'
  const text = `Enter ${returnRequirementFrequencies[returnsFrequency]} ${linkTextMethod}`
  const yearMonth = `${endDate.getFullYear()}-${endDate.getMonth()}`

  return {
    href: `/system/return-logs/setup/${sessionId}/${linkTextMethod}/${yearMonth}`,
    text
  }
}

function _note(note) {
  if (note?.content) {
    return {
      actions: [
        { text: 'Change', href: 'note' },
        { text: 'Delete', href: 'delete-note' }
      ],
      text: note.content
    }
  } else {
    return {
      actions: [{ text: 'Add a note', href: 'note' }],
      text: 'No notes added'
    }
  }
}

function _summaryTableData(formattedLines, session, unitSymbol) {
  const { id: sessionId, reported, returnsFrequency } = session

  const alwaysDisplayLinkHeader = true

  return {
    headers: generateSummaryTableHeaders(reported, returnsFrequency, unitSymbol, alwaysDisplayLinkHeader),
    rows: _summaryTableRows(formattedLines, reported, returnsFrequency, sessionId)
  }
}

function _summaryTableRows(formattedLines, reported, returnsFrequency, sessionId) {
  const groups = returnsFrequency === 'month' ? formattedLines : _groupLinesByMonth(formattedLines)

  return groups.map((group) => {
    const { endDate, quantity, quantityCubicMetres, reading } = group

    const rowData = {
      link: _linkDetails(endDate, reported, returnsFrequency, sessionId),
      month: endDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      monthlyTotal: formatNumber(quantityCubicMetres),
      unitTotal: formatNumber(quantity)
    }

    if (reported !== ABSTRACTION_VOLUMES_METHOD) {
      rowData.reading = reading
    }

    return rowData
  })
}

function _tableTitle(reported, returnsFrequency) {
  const frequency = returnRequirementFrequencies[returnsFrequency]
  const method = reported === ABSTRACTION_VOLUMES_METHOD ? 'volumes' : 'readings'

  return `Summary of ${frequency} ${method}`
}

function _totalQuantity(lines) {
  const totalQuantity = lines.reduce((acc, line) => {
    const quantity = line.quantity ?? 0

    return Big(acc).plus(quantity).toNumber()
  }, 0)

  return formatNumber(totalQuantity)
}

function _totalCubicMetres(lines) {
  const totalCubicMetres = lines.reduce((acc, line) => {
    const quantityCubicMetres = line.quantityCubicMetres ?? 0

    return Big(acc).plus(quantityCubicMetres).toNumber()
  }, 0)

  return formatNumber(totalCubicMetres)
}

module.exports = {
  go
}
