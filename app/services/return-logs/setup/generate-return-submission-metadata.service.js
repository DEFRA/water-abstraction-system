'use strict'

/**
 * Generates metadata for a new return submission
 * @module GenerateReturnSubmissionMetadata
 */

const UNIT_NAMES = {
  'cubic-metres': 'm³',
  litres: 'l',
  megalitres: 'Ml',
  gallons: 'gal'
}

/**
 * TODO: Implement and document
 *
 * @param session
 *
 * @param trx
 * @returns
 */
function go(session) {
  return {
    type: session.reported === 'abstraction-volumes' ? 'estimated' : 'measured',
    method: session.reported === 'abstraction-volumes' ? 'abstractionVolumes' : 'oneMeter',
    units: UNIT_NAMES[session.units],
    meters: [], // TODO: Implement this
    ..._total(session)
  }
}

function _total(session) {
  const total = {
    totalFlag: !!session.singleVolume,
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
