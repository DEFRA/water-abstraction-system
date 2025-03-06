'use strict'

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/check` page
 * @module CheckPresenter
 */

const { formatAbstractionPeriod, formatLongDate, formatNumber, sentenceCase } = require('../../base.presenter.js')
const { convertToCubicMetres, generateSummaryTableHeaders } = require('../base-return-logs.presenter.js')
const { returnRequirementFrequencies } = require('../../../lib/static-lookups.lib.js')

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/check` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} page data needed for the `/return-logs/setup/{sessionId}/check` page
 */
function go(session) {
  const UNIT_NAMES = {
    'cubic-metres': 'm³',
    litres: 'l',
    megalitres: 'Ml',
    gallons: 'gal'
  }

  const alwaysRequiredPageData = _alwaysRequiredPageData(session)

  if (session.journey === 'nil-return') {
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
    units
  } = session
  const unitName = UNIT_NAMES[units]
  const formattedLines = _formatLines(lines, meter10TimesDisplay, reported, startReading, unitName)
  const totalQuantity = _totalQuantity(formattedLines)

  return {
    ...alwaysRequiredPageData,
    displayReadings: reported === 'meter-readings',
    displayUnits: units !== 'cubic-metres',
    meter10TimesDisplay,
    meterMake,
    meterProvided,
    meterSerialNumber,
    reportingFigures: reported === 'meter-readings' ? 'Meter readings' : 'Volumes',
    startReading,
    summaryTableData: _summaryTableData(formattedLines, session, unitName),
    tableTitle: _tableTitle(reported, returnsFrequency),
    totalCubicMetres: convertToCubicMetres(totalQuantity, unitName),
    totalQuantity: formatNumber(totalQuantity),
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

function _formatLines(lines, meter10TimesDisplay, reported, startReading, unitName) {
  const formattedLines = []
  let previousReading = startReading ?? 0

  lines.forEach((line) => {
    const formattedLine = {
      endDate: new Date(line.endDate),
      startDate: new Date(line.startDate),
      unitName
    }

    if (reported !== 'meter-readings') {
      formattedLine.quantity = line.quantity ?? null
    } else {
      formattedLine.reading = line.reading ?? null

      if (line.reading) {
        const multiplier = meter10TimesDisplay === 'yes' ? 10 : 1

        formattedLine.quantity = (line.reading - previousReading) * multiplier
        previousReading = line.reading
      } else {
        formattedLine.quantity = null
      }
    }

    formattedLines.push(formattedLine)
  })

  return formattedLines
}

function _groupLinesByMonth(formattedLines) {
  const groupedLines = formattedLines.reduce((acc, line) => {
    const { endDate, quantity, reading, unitName } = line
    const key = `${endDate.getFullYear()}-${endDate.getMonth()}`

    if (!acc[key]) {
      acc[key] = {
        endDate,
        quantity: 0,
        unitName
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

function _linkDetails(endDate, method, returnsFrequency, sessionId) {
  const linkTextMethod = method === 'abstractionVolumes' ? 'volumes' : 'readings'
  const text = `Enter ${returnRequirementFrequencies[returnsFrequency]} ${linkTextMethod}`
  const yearMonth = `${endDate.getFullYear()}-${endDate.getMonth()}`

  return {
    href: `/system/return-logs/setup/${sessionId}/${yearMonth}`,
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

function _summaryTableData(formattedLines, session, unitName) {
  const { id: sessionId, reported, returnsFrequency } = session

  const alwaysDisplayLinkHeader = true
  const method = reported === 'abstraction-volumes' ? 'abstractionVolumes' : reported

  return {
    headers: generateSummaryTableHeaders(method, returnsFrequency, unitName, alwaysDisplayLinkHeader),
    rows: _summaryTableRows(formattedLines, method, returnsFrequency, sessionId)
  }
}

function _summaryTableRows(formattedLines, method, returnsFrequency, sessionId) {
  const groups = returnsFrequency === 'month' ? formattedLines : _groupLinesByMonth(formattedLines)

  return groups.map((group) => {
    const { endDate, quantity, reading, unitName } = group

    const rowData = {
      link: _linkDetails(endDate, method, returnsFrequency, sessionId),
      month: endDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      monthlyTotal: convertToCubicMetres(quantity, unitName),
      unitTotal: formatNumber(quantity)
    }

    if (method !== 'abstractionVolumes') {
      rowData.reading = reading
    }

    return rowData
  })
}

function _tableTitle(reported, returnsFrequency) {
  const frequency = returnRequirementFrequencies[returnsFrequency]
  const method = reported === 'abstraction-volumes' ? 'abstraction volumes' : 'meter readings'

  return `Summary of ${frequency} ${method}`
}

function _totalQuantity(lines) {
  const totalQuantity = lines.reduce((acc, line) => {
    const quantity = line.quantity ?? 0

    return acc + quantity
  }, 0)

  return totalQuantity
}

module.exports = {
  go
}
