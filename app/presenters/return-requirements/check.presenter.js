'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/check` page
 * @module CheckPresenter
 */

const { formatAbstractionDate, formatLongDate } = require('../base.presenter.js')
const { returnRequirementReasons } = require('../../lib/static-lookups.lib.js')

function go (session) {
  const { additionalSubmissionOptions, id: sessionId, journey, licence, note, reason } = session

  return {
    additionalSubmissionOptions: additionalSubmissionOptions ?? [],
    journey,
    licenceRef: licence.licenceRef,
    note: note ? note.content : null,
    pageTitle: `Check the return requirements for ${licence.licenceHolder}`,
    reason: returnRequirementReasons[reason],
    reasonLink: _reasonLink(sessionId, journey),
    requirements: _requirements(session),
    sessionId,
    startDate: _startDate(session),
    userEmail: note ? note.userEmail : 'No notes added'
  }
}

function _abstractionPeriod (abstractionPeriod) {
  const { 'start-abstraction-period-day': startDay, 'start-abstraction-period-month': startMonth, 'end-abstraction-period-day': endDay, 'end-abstraction-period-month': endMonth } = abstractionPeriod
  const startDate = formatAbstractionDate(startDay, startMonth)
  const endDate = formatAbstractionDate(endDay, endMonth)

  return `From ${startDate} to ${endDate}`
}

function _reasonLink (sessionId, journey) {
  if (journey === 'returns-required') {
    return `/system/return-requirements/${sessionId}/reason`
  }

  return `/system/return-requirements/${sessionId}/no-returns-required`
}

function _requirements (session) {
  const { requirements } = session

  const completedRequirements = []

  for (const [index, requirement] of requirements.entries()) {
    const { agreementsExceptions } = requirement
    // NOTE: We determine a requirement is complete because agreement exceptions is populated and it is the last step in
    // the journey
    if (agreementsExceptions) {
      completedRequirements.push(_mapRequirement(requirement, index))
    }
  }

  return completedRequirements
}

function _mapRequirement (requirement, index) {
  return {
    abstractionPeriod: _abstractionPeriod(requirement.abstractionPeriod),
    frequencyCollected: requirement.frequencyCollected,
    frequencyReported: requirement.frequencyReported,
    index,
    purposes: 'purpose',
    siteDescription: requirement.siteDescription
  }
}

function _startDate (session) {
  const { licence, startDateOptions, startDateDay, startDateMonth, startDateYear } = session

  let date

  if (startDateOptions === 'licenceStartDate') {
    date = new Date(licence.currentVersionStartDate)
  } else {
    date = new Date(`${startDateYear}-${startDateMonth}-${startDateDay}`)
  }

  return formatLongDate(date)
}

module.exports = {
  go
}
