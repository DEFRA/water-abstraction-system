'use strict'

/**
 * Orchestrates submitting the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @module SubmitCheckService
 */

const LicenceMonitoringStationModel = require('../../../models/licence-monitoring-station.model.js')
const SessionModel = require('../../../models/session.model.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js') // TODO: Double-check the require ordering
const { thresholdUnits } = require('../../../lib/static-lookups.lib.js')

/**
 * Orchestrates submitting the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @param {string} sessionId
 *
 * @returns
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  // TODO: Ensure success banner is displayed when we return to the monitoring stations page

  await _createTag(session)

  await session.$query().delete()

  return session.monitoringStationId
}

async function _createTag(session) {
  return LicenceMonitoringStationModel.query().insert({
    ..._determineConditionOrAbstractionPeriod(session),
    licenceId: session.licenceId,
    monitoringStationId: session.monitoringStationId,
    measureType: _determineMeasureType(session.unit),
    source: 'wrls',
    thresholdUnit: session.unit,
    thresholdValue: session.threshold,
    restrictionType: _determineRestrictionType(session.stopOrReduce, session.reduceAtThreshold),
    createdAt: timestampForPostgres(),
    updatedAt: timestampForPostgres()
  })
}

function _determineConditionOrAbstractionPeriod(session) {
  return session.licenceVersionPurposeConditionId
    ? {
        licenceVersionPurposeConditionId: session.licenceVersionPurposeConditionId
      }
    : {
        abstractionPeriodStartDay: session.abstractionPeriodStartDay,
        abstractionPeriodStartMonth: session.abstractionPeriodStartMonth,
        abstractionPeriodEndDay: session.abstractionPeriodEndDay,
        abstractionPeriodEndMonth: session.abstractionPeriodEndMonth
      }
}

function _determineMeasureType(unit) {
  const thresholdUnitsArray = Object.values(thresholdUnits)

  const matchedUnit = thresholdUnitsArray.find(({ value }) => {
    return value === unit
  })

  return matchedUnit.measureType
}

function _determineRestrictionType(stopOrReduce, reduceAtThreshold) {
  return stopOrReduce === 'reduce' && reduceAtThreshold === 'yes' ? 'stop_or_reduce' : stopOrReduce
}

module.exports = {
  go
}
