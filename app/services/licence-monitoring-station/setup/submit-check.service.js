'use strict'

/**
 * Orchestrates submitting the data for `/licence-monitoring-station/setup/{sessionId}/check`
 *
 * @module SubmitCheckService
 */

const DeleteSessionDal = require('../../../dal/delete-session.dal.js')
const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const LicenceMonitoringStationModel = require('../../../models/licence-monitoring-station.model.js')
const { flashNotification, timestampForPostgres } = require('../../../lib/general.lib.js')
const { flowUnits } = require('../../../lib/static-lookups.lib.js')

/**
 * Orchestrates submitting the data for `/licence-monitoring-station/setup/{sessionId}/check`
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} userId - The ID of the current user
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<string>} The monitoring station id used to redirect back to the monitoring station page
 */
async function go(sessionId, userId, yar) {
  const session = await FetchSessionDal.go(sessionId)

  await _createTag(session, userId)

  await DeleteSessionDal.go(sessionId)

  flashNotification(yar, 'Success', `Tag for licence ${session.licenceRef} added`)

  return session.monitoringStationId
}

async function _createTag(session, userId) {
  return LicenceMonitoringStationModel.query().insert({
    abstractionPeriodStartDay: session.abstractionPeriodStartDay,
    abstractionPeriodStartMonth: session.abstractionPeriodStartMonth,
    abstractionPeriodEndDay: session.abstractionPeriodEndDay,
    abstractionPeriodEndMonth: session.abstractionPeriodEndMonth,
    createdBy: userId,
    licenceId: session.licenceId,
    licenceVersionPurposeConditionId: session.conditionId === 'no_condition' ? null : session.conditionId,
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

function _determineMeasureType(unit) {
  return flowUnits.includes(unit) ? 'flow' : 'level'
}

function _determineRestrictionType(stopOrReduce, reduceAtThreshold) {
  return stopOrReduce === 'reduce' && reduceAtThreshold === 'yes' ? 'stop_or_reduce' : stopOrReduce
}

module.exports = {
  go
}
