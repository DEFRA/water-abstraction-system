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
    // Legacy code sets reported to `estimated` ONLY if this is volumes with no meter; otherwise it's `measured`
    type: session.reported === 'abstraction-volumes' && session.meterProvided === 'no' ? 'estimated' : 'measured',
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
  // Legacy code sets meters array as empty ONLY if we have volumes with no meter; otherwise we populate the array
  if (session.reported === 'abstraction-volumes' && session.meterProvided === 'no') {
    return []
  }

  if (session.reported === 'abstraction-volumes' && session.meterProvided === 'yes') {
    return [
      {
        multiplier: session.meter10TimesDisplay === 'yes' ? 10 : 1,
        manufacturer: session.meterMake,
        serialNumber: session.meterSerialNumber,
        meterDetailsProvided: true
      }
    ]
  }

  // At this point, we know that session.reported is 'meter-readings'

  // These details are always included in the meter object
  const meter = {
    units: getUnitSymbolByName(session.units),
    readings: _formatReadings(session.lines),
    multiplier: session.meter10TimesDisplay === 'yes' ? 10 : 1,
    startReading: session.startReading,
    meterDetailsProvided: session.meterProvided === 'yes'
  }

  if (meter.meterDetailsProvided) {
    meter.manufacturer = session.meterMake
    meter.serialNumber = session.meterSerialNumber
  }

  return [meter]
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
