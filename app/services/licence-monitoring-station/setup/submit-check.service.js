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
    licenceId: session.licenceId,
    monitoringStationId: session.monitoringStationId,
    // TODO: Correctly set the following:
    // licenceVersionPurposeConditionId: null,
    // abstractionPeriodStartDay: null,
    // abstractionPeriodStartMonth: null,
    // abstractionPeriodEndDay: null,
    // abstractionPeriodEndMonth: null,
    measureType: _determineMeasureType(session),
    source: 'wrls',
    thresholdUnit: session.unit,
    thresholdValue: session.threshold,
    restrictionType: session.stopOrReduce, // TODO: Check about the `stop_or_reduce` entries we can see in the db
    createdAt: timestampForPostgres(),
    updatedAt: timestampForPostgres()
  })
}

function _determineMeasureType(session) {
  const thresholdUnitsArray = Object.values(thresholdUnits)

  const matchedUnit = thresholdUnitsArray.find(({ value }) => {
    return value === session.unit
  })

  return matchedUnit.measureType
}

module.exports = {
  go
}
