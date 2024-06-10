'use strict'

/**
 * Persists the Return Requirements journey data
 * @module PersistReturnRequirementsService
 */

const ReturnRequirementModel = require('../../../models/return-requirement.model.js')

/**
 * Persists the Requirements journey data based on session data
 *
 * Builds and persists a return version per return requirement
 *
 * Builds and persists the return requirements
 *
 * @param {module:SessionModel} session - The session for the return requirement journey
 *
 */
async function go (session) {
  const { startDateDay, startDateYear, startDateMonth, licence, reason, requirements } = session

  const returnVersion = _buildReturnVersion(startDateDay, startDateYear, startDateMonth, licence, reason)
  const returnRequirements = _buildReturnRequirements(requirements, returnVersion)

  await _persistData(returnRequirements, returnVersion)
}

function _buildReturnVersion (startDateDay, startDateYear, startDateMonth, licence, reason) {
  const startDate = startDateDay
    ? new Date(`${startDateYear}-${startDateMonth}-${startDateDay}`)
    : licence.currentVersionStartDate

  return {
    version: 1,
    licenceId: licence.id,
    startDate,
    status: 'current',
    reason
  }
}

function _buildReturnRequirements (requirements, returnVersion) {
  return requirements
    // Strip empty objects off array - investigate bug
    .filter((requirement) => { return Object.keys(requirement).length > 0 })
    .map((requirement) => {
      return {
        ..._mapRequirementToReturnRequirementSchema(requirement),
        returnVersion
      }
    })
}

function _mapRequirementToReturnRequirementSchema (requirement) {
  return {
    summer: requirement.returnsCycle === 'summer',
    siteDescription: requirement.siteDescription,
    abstraction_period_end_day: requirement.abstractionPeriod['end-abstraction-period-day'],
    abstraction_period_end_month: requirement.abstractionPeriod['end-abstraction-period-month'],
    abstraction_period_start_day: requirement.abstractionPeriod['start-abstraction-period-day'],
    abstraction_period_start_month: requirement.abstractionPeriod['start-abstraction-period-month'],
    reportingFrequency: requirement.frequencyReported,
    collectionFrequency: requirement.frequencyCollected,
    returns_frequency: 'year' // need to know this
  }
}

async function _persistData (returnRequirements) {
  return ReturnRequirementModel.query()
    .insertGraph(returnRequirements)
}

module.exports = {
  go
}
