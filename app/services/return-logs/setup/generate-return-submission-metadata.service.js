'use strict'

/**
 * Generates return submission metatadata
 * @module GenerateReturnSubmissionMetadata
 */

const { formatDateObjectToISO } = require('../../../lib/dates.lib.js')
const { returnUnits } = require('../../../lib/static-lookups.lib.js')

const REPORTED = {
  VOLUMES: 'abstraction-volumes',
  READINGS: 'meter-readings'
}

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
    meters: _determineMeters(session),
    method: session.reported === REPORTED.VOLUMES ? 'abstractionVolumes' : 'oneMeter',
    units: getUnitSymbolByName(session.units),
    // Legacy code sets reported to `estimated` ONLY if we have volumes with no meter; otherwise it's `measured`
    type: session.reported === REPORTED.VOLUMES && session.meterProvided === 'no' ? 'estimated' : 'measured',
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

function _determineMeters(session) {
  // We set meters array as empty ONLY if we have volumes with no meter; in all other scenarios we populate the array
  if (session.reported === REPORTED.VOLUMES && session.meterProvided === 'no') {
    return []
  }

  // Otherwise, we return an array containing a single meter object
  return [
    {
      meterDetailsProvided: session.meterProvided === 'yes',
      // Legacy code always sets multiplier, regardless of whether we have meter details. We follow suit for consistency
      multiplier: session.meter10TimesDisplay === 'yes' ? 10 : 1,
      // Manufacturer and serial number are only set if meter details are provided
      ...(session.meterProvided === 'yes' && {
        manufacturer: session.meterMake,
        serialNumber: session.meterSerialNumber
      }),
      // Units, readings and start reading are only set if this is a meter reading return
      ...(session.reported === REPORTED.READINGS && {
        units: getUnitSymbolByName(session.units),
        readings: _formatReadings(session.lines),
        startReading: session.startReading
      })
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
