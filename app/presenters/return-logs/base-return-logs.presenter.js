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

function formatStartReading(meter) {
  if (!meter) {
    return null
  }

  return meter.startReading ?? null
}

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

function generateSummaryTableRows(id, method, frequency, lines, rootPath = '/system/return-submissions') {
  if (frequency === 'week') {
    return []
  }

  const rows = lines.reduce((acc, line) => {
    const { endDate, quantity } = line
    const key = `${endDate.getFullYear()}-${endDate.getMonth()}`

    if (acc[key]) {
      acc[key].quantity += quantity
    } else {
      acc[key].quantity = quantity
    }

    if (line.reading) {
      acc[key].reading = line.reading
    }

    return acc
  }, {})

  return lines.map((line) => {
    const { endDate, quantity, userUnit } = line

    const rowData = {
      month: endDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      monthlyTotal: formatNumber(quantity)
    }

    if (method !== 'abstractionVolumes') {
      rowData.reading = line.reading
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
