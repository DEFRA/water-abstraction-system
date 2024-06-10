'use strict'

/**
 * Persists the Return Requirements journey data
 * @module PersistReturnRequirementsService
 */

const ReturnRequirementModel = require('../../../models/return-requirement.model.js')
const ReturnVersionModel = require('../../../models/return-version.model.js')

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
  const persistedReturnVersion = await _persistReturnVersion(returnVersion)

  // Strip empty objects off array - investigate bug
  const normalisedRequirements = requirements.filter((requirement) => { return Object.keys(requirement).length > 0 })

  if (normalisedRequirements.length > 0) {
    const returnRequirements = _buildReturnRequirements(normalisedRequirements, persistedReturnVersion.id)
    await _persistReturnRequirements(returnRequirements)
  }
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

function _buildReturnRequirements (requirements, returnVersionId) {
  return requirements
    .map((requirement) => {
      return {
        ..._mapRequirementToReturnRequirementSchema(requirement),
        returnVersionId
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

async function _persistReturnRequirements (data) {
  return ReturnRequirementModel.query()
    .insertGraph(data)
}

async function _persistReturnVersion (data) {
  return ReturnVersionModel.query()
    .insertGraph(data)
}

module.exports = {
  go
}
