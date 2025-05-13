'use strict'

/**
 * Generates return submission metatadata
 * @module GenerateReturnSubmissionMetadata
 */

const { formatDateObjectToISO } = require('../../../lib/dates.lib.js')
const { returnUnits } = require('../../../lib/static-lookups.lib.js')

/**
 * Generates return submission metatadata based on the provided session data
 *
 * @param {object} session - Session object containing the return submission data
 *
 * @returns {object} The return submission metadata
 */
function go(session) {
  // Metadata is not required for nil returns
  if (session.journey === 'nil-return') {
    return {}
  }

  return {
    meters: _meters(session),
    method: session.reported === 'abstraction-volumes' ? 'abstractionVolumes' : 'oneMeter',
    type: session.meterProvided === 'no' ? 'estimated' : 'measured',
    units: getUnitSymbolByName(session.units),
    ..._totalProperties(session)
  }
}

function _formatReadings(lines) {
  return lines.reduce((acc, line) => {
    const { startDate, endDate, reading } = line

    const key = `${formatDateObjectToISO(new Date(startDate))}_${formatDateObjectToISO(new Date(endDate))}`
    acc[key] = reading

    return acc
  }, {})
}

function _meters(session) {
  if (session.meterProvided === 'no') {
    return []
  }

  return [
    {
      manufacturer: session.meterMake,
      meterDetailsProvided: true, // We can hardcode this true as we only return meter details if meterProvided is `yes`
      multiplier: session.meter10TimesDisplay === 'yes' ? 10 : 1,
      serialNumber: session.meterSerialNumber,
      startReading: session.startReading,
      readings: _formatReadings(session.lines),
      // We use the spread operator to add the units property only if there are lines present
      ...(session.lines.length > 0 && { units: getUnitSymbolByName(session.units) })
    }
  ]
}

function _totalProperties(session) {
  if (!session.singleVolume) {
    return {
      totalFlag: false
    }
  }

  const total = {
    totalFlag: true,
    total: session.singleVolume ? session.singleVolumeQuantity : null,
    totalCustomDates: session.singleVolume && session.periodDateUsedOptions === 'custom-dates'
  }

  return {
    ...total,
    // Custom date fields are only required if the custom date option has been selected
    ...(total.totalCustomDates && {
      totalCustomDateStart: session.fromFullDate,
      totalCustomDateEnd: session.toFullDate
    })
  }
}

function getUnitSymbolByName(name) {
  return Object.keys(returnUnits).find((key) => {
    return returnUnits[key].name === name
  })
}

module.exports = {
  go
}
