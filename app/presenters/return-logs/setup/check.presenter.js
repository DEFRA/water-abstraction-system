'use strict'

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/check` page
 * @module CheckPresenter
 */

const {
  formatAbstractionPeriod,
  formatLongDate,
  formatNumber,
  formatQuantity,
  sentenceCase
} = require('../../base.presenter.js')
const { generateSummaryTableHeaders, generateSummaryTableRows } = require('../base-return-logs.presenter.js')
const { returnRequirementFrequencies } = require('../../../lib/static-lookups.lib.js')

const UNIT_NAMES = {
  'cubic-metres': 'm³',
  litres: 'l',
  megalitres: 'Ml',
  gallons: 'gal'
}

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/check` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} page data needed for the `/return-logs/setup/{sessionId}/check` page
 */
function go(session) {
  const alwaysRequiredPageData = _alwaysRequiredPageData(session)

  if (session.journey === 'nil-return') {
    return alwaysRequiredPageData
  }

  const { lines, meterMake, meterProvided, meterSerialNumber, reported, returnsFrequency, startReading, units } =
    session
  const totalQuantity = _totalQuantity(lines)

  return {
    ...alwaysRequiredPageData,
    displayReadings: reported === 'meter-readings',
    displayUnits: units !== 'cubic-metres',
    meterMake,
    meterProvided,
    meterSerialNumber,
    reportingFigures: reported === 'meter-readings' ? 'Meter readings' : 'Volumes',
    startReading,
    summaryTableData: _summaryTableData(session),
    tableTitle: _tableTitle(returnsFrequency, reported),
    totalCubicMetres: formatQuantity(UNIT_NAMES[units], totalQuantity),
    totalQuantity,
    units: units === 'cubic-metres' ? 'Cubic metres' : sentenceCase(units)
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
      nilReturn: `/system/return-logs/setup/${sessionId}/submission`,
      received: `/system/return-logs/setup/${sessionId}/received`,
      reported: `/system/return-logs/setup/${sessionId}/reported`,
      units: `/system/return-logs/setup/${sessionId}/units`
    },
    nilReturn: journey === 'nil-return' ? 'Yes' : 'No',
    note: _note(note),
    pageTitle: 'Check details and enter new volumes or readings',
    purposes: purposes.join(', '),
    returnPeriod: `${formatLongDate(new Date(startDate))} to ${formatLongDate(new Date(endDate))}`,
    returnReceivedDate: formatLongDate(new Date(receivedDate)),
    returnReference,
    siteDescription,
    tariff: twoPartTariff ? 'Two-part' : 'Standard'
  }
}

function _formatLines(lines, userUnit) {
  const formattedLines = lines.map((line) => ({
    quantity: null,
    ...line,
    endDate: new Date(line.endDate),
    startDate: new Date(line.startDate),
    userUnit
  }))

  return formattedLines
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

function _summaryTableData(session) {
  const { id: sessionId, lines, reported, returnsFrequency, units } = session

  const alwaysDisplayLinkHeader = true
  const linkPrefix = 'Enter'
  const method = reported === 'abstraction-volumes' ? 'abstractionVolumes' : reported
  const rootPath = '/system/return-logs/setup'

  const userUnit = UNIT_NAMES[units]
  const formattedLines = _formatLines(lines, userUnit)

  return {
    headers: generateSummaryTableHeaders(method, returnsFrequency, userUnit, alwaysDisplayLinkHeader),
    rows: generateSummaryTableRows(method, returnsFrequency, formattedLines, sessionId, linkPrefix, rootPath)
  }
}

function _tableTitle(returnsFrequency, reported) {
  const frequency = returnRequirementFrequencies[returnsFrequency]
  const method = reported === 'abstraction-volumes' ? 'abstraction volumes' : 'meter readings'

  return `Summary of ${frequency} ${method}`
}

function _totalQuantity(lines) {
  const totalQuantity = lines.reduce((acc, line) => {
    const quantity = line.quantity ?? 0

    return acc + quantity
  }, 0)

  return formatNumber(totalQuantity)
}

module.exports = {
  go
}
