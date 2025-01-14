'use strict'

const { formatNumber, sentenceCase } = require('../base.presenter.js')
const { returnRequirementFrequencies, returnUnits, unitNames } = require('../../lib/static-lookups.lib.js')

function formatQuantity(units, quantity) {
  if (!quantity) {
    return null
  }

  const convertedQuantity = quantity * returnUnits[units].multiplier

  return formatNumber(convertedQuantity)
}

/**
 *
 * @param meter
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
 *
 * @param meter
 */
function formatStartReading(meter) {
  if (!meter) {
    return null
  }

  return meter.startReading ?? null
}

/**
 *
 * @param method
 * @param frequency
 * @param units
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

  headers.push({ text: sentenceCase(`${quantityPostfix}cubic meters`), format: 'numeric' })

  if (frequency !== 'month') {
    headers.push({ text: 'Details', format: 'numeric' })
  }

  return headers
}

/**
 *
 * @param id
 * @param method
 * @param frequency
 * @param lines
 * @param rootPath
 */
function generateSummaryTableRows(id, method, frequency, lines, rootPath = '/system/return-submissions') {
  const rowsObject = lines.reduce((acc, line) => {
    const { endDate, quantity, reading, userUnit } = line
    const key = `${endDate.getFullYear()}-${endDate.getMonth()}`

    if (acc[key]) {
      acc[key].quantity += quantity
    } else {
      acc[key] = _initialiseRow(endDate, quantity, userUnit, method)
    }

    acc[key].monthlyTotal = formatNumber(acc[key].quantity)

    if (userUnit !== unitNames.CUBIC_METRES) {
      acc[key].unitTotal = formatQuantity(userUnit, quantity)
    }

    if (line.reading) {
      acc[key].reading = reading
    }

    if (frequency !== 'month') {
      acc[key].link = _linkDetails(id, method, frequency, endDate, rootPath)
    }

    return acc
  }, {})

  return Object.values(rowsObject)
}

function _initialiseRow(endDate, quantity, userUnit) {
  const row = {
    endDate,
    month: endDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    quantity,
    userUnit
  }

  return row
}

function _linkDetails(id, method, frequency, endDate, rootPath) {
  const linkTextMethod = method === 'abstractionVolumes' ? 'volumes' : 'readings'
  const text = `View ${returnRequirementFrequencies[frequency]} ${linkTextMethod}`
  const monthIndex = endDate.getMonth()

  return {
    href: `${rootPath}/${id}/${monthIndex}`,
    text
  }
}

module.exports = {
  formatMeterDetails,
  formatStartReading,
  generateSummaryTableHeaders,
  generateSummaryTableRows
}
