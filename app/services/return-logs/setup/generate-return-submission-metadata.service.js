'use strict'

/**
 * Generates metadata for a new return submission
 * @module GenerateReturnSubmissionMetadata
 */

const { formatDateObjectToISO } = require('../../../lib/dates.lib.js')

const UNIT_NAMES = {
  'cubic-metres': 'm³',
  litres: 'l',
  megalitres: 'Ml',
  gallons: 'gal'
}

/**
 * TODO: Document
 *
 * @param session
 *
 * @returns
 */
function go(session) {
  return {
    type: session.meterProvided === 'no' ? 'estimated' : 'measured',
    method: session.reported === 'abstraction-volumes' ? 'abstractionVolumes' : 'oneMeter',
    units: UNIT_NAMES[session.units],
    meters: _meters(session),
    ..._total(session)
  }
}

function _formatReadings(lines) {
  return lines.reduce((acc, line) => {
    const { startDate, endDate, quantity } = line

    const key = `${formatDateObjectToISO(new Date(startDate))}_${formatDateObjectToISO(new Date(endDate))}`
    acc[key] = quantity

    return acc
  }, {})
}

function _meters(session) {
  if (session.meterProvided === 'no') {
    return []
  }

  return [
    {
      units: UNIT_NAMES[session.units],
      meterDetailsProvided: true, // We hardcode this to true as we only return meter details if meterProvided is `yes`
      multiplier: session.meter10TimesDisplay === 'yes' ? 10 : 1,
      manufacturer: session.meterMake,
      serialNumber: session.meterSerialNumber,
      startReading: session.meterStartReading,
      readings: _formatReadings(session.lines)
    }
  ]
}

function _total(session) {
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

  const totalCustomDates = {
    totalCustomDateStart: total.totalCustomDates ? session.fromFullDate : undefined,
    totalCustomDateEnd: total.totalCustomDates ? session.toFullDate : undefined
  }

  return {
    ...total,
    ...totalCustomDates
  }
}

module.exports = {
  go
}
