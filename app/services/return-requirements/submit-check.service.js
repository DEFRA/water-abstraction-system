'use strict'

/**
 * Manages converting the session data to return requirement records when check return requirements is confirmed
 * @module SubmitCheckService
 */

const CheckLicenceEndedService = require('./check-licence-ended.service.js')
const ExpandedError = require('../../errors/expanded.error.js')
const SessionModel = require('../../models/session.model.js')
const ReturnRequirementModel = require('../../models/return-requirement.model.js')

/**
 * Manages converting the session data to return requirement records when check return requirements is confirmed
 *
 * > This service is work in progress. Some of the functionality described is yet to be implemented
 *
 * After fetching the session instance for the returns requirements journey in progress it validates that what the user
 * has setup can be persisted for the licence.
 *
 * If valid it converts the session data to return requirements records then deletes the session record.
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 *
 * @returns {string} The licence ID
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  await _validateLicence(session.licence.id)

  await _createNewReturnsRequirement(session)

  return session.licence.id
}

async function _validateLicence (licenceId) {
  const licenceEnded = await CheckLicenceEndedService.go(licenceId)

  if (!licenceEnded) {
    return
  }

  throw new ExpandedError('Invalid licence for return requirements', { licenceId, licenceEnded })
}

async function _createNewReturnsRequirement (session) {
  // either licence start or selected,
  const startDate = session.startDateDay ? new Date(`${session.startDateYear}-${session.startDateMonth}-${session.startDateDay}`) : session.licence.currentVersionStartDate

  const returnVersion = {
    version: 1,
    licenceId: session.licence.id,
    startDate,
    status: 'current',
    reason: session.reason
  }

  const mappedRequirements = session.requirements
    .filter((requirement) => { return Object.keys(requirement).length > 0 })
    .map((requirement) => {
      return {
        summer: requirement.returnsCycle === 'summer',
        siteDescription: requirement.siteDescription,
        abstraction_period_end_day: requirement.abstractionPeriod['end-abstraction-period-day'],
        abstraction_period_end_month: requirement.abstractionPeriod['end-abstraction-period-month'],
        abstraction_period_start_day: requirement.abstractionPeriod['start-abstraction-period-day'],
        abstraction_period_start_month: requirement.abstractionPeriod['start-abstraction-period-month'],
        reportingFrequency: requirement.frequencyReported,
        collectionFrequency: requirement.frequencyCollected,
        returns_frequency: 'year', // need to know this
        returnVersion
      }
    })

  return ReturnRequirementModel.query()
    .insertGraph(mappedRequirements)
}

module.exports = {
  go
}
