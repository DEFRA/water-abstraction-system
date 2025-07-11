'use strict'

/**
 * Orchestrates submitting the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @module SubmitCheckService
 */

const { flashNotification, timestampForPostgres } = require('../../../lib/general.lib.js')
const LicenceMonitoringStationModel = require('../../../models/licence-monitoring-station.model.js')
const SessionModel = require('../../../models/session.model.js')
const { flowUnits } = require('../../../lib/static-lookups.lib.js')

/**
 * Orchestrates submitting the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<string>} The monitoring station id used to redirect back to the monitoring station page
 */
async function go(sessionId, yar) {
  const session = await SessionModel.query().findById(sessionId)

  await _createTag(session)

  await session.$query().delete()

  flashNotification(yar, 'Success', `Tag for licence ${session.licenceRef} added`)

  return session.monitoringStationId
}

async function _createTag(session) {
  return LicenceMonitoringStationModel.query().insert({
    ..._determineAbstractionPeriodOrCondition(session),
    licenceId: session.licenceId,
    measureType: _determineMeasureType(session.unit),
    monitoringStationId: session.monitoringStationId,
    restrictionType: _determineRestrictionType(session.stopOrReduce, session.reduceAtThreshold),
    source: 'wrls',
    thresholdUnit: session.unit,
    thresholdValue: session.threshold,
    createdAt: timestampForPostgres(),
    updatedAt: timestampForPostgres()
  })
}

function _determineAbstractionPeriodOrCondition(session) {
  return session.conditionId === 'no_condition'
    ? {
        abstractionPeriodStartDay: session.abstractionPeriodStartDay,
        abstractionPeriodStartMonth: session.abstractionPeriodStartMonth,
        abstractionPeriodEndDay: session.abstractionPeriodEndDay,
        abstractionPeriodEndMonth: session.abstractionPeriodEndMonth
      }
    : {
        licenceVersionPurposeConditionId: session.conditionId
      }
}

function _determineMeasureType(unit) {
  return flowUnits.includes(unit) ? 'flow' : 'level'
}

function _determineRestrictionType(stopOrReduce, reduceAtThreshold) {
  return stopOrReduce === 'reduce' && reduceAtThreshold === 'yes' ? 'stop_or_reduce' : stopOrReduce
}

module.exports = {
  go
}
