/**
 * Tags a licence to a monitoring station by creating a licence monitoring station record
 *
 * @module CreateTagDal
 */

import LicenceMonitoringStationModel from 'water-abstraction-engine/models/licence-monitoring-station.model.js'
import { flowUnits } from 'water-abstraction-engine/lib/static-lookups.lib.js'
import { timestampForPostgres } from 'water-abstraction-engine/lib/general.lib.js'

/**
 * Tags a licence to a monitoring station by creating a licence monitoring station record
 *
 * @param {object} session - The session object containing the data for the current session
 * @param {string} userId - The ID of the current user
 */
export default async function createTagDal(session, userId) {
  const timestamp = timestampForPostgres()

  await LicenceMonitoringStationModel.query().insert({
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
    createdAt: timestamp,
    updatedAt: timestamp
  })
}

function _determineMeasureType(unit) {
  return flowUnits.includes(unit) ? 'flow' : 'level'
}

function _determineRestrictionType(stopOrReduce, reduceAtThreshold) {
  return stopOrReduce === 'reduce' && reduceAtThreshold === 'yes' ? 'stop_or_reduce' : stopOrReduce
}
