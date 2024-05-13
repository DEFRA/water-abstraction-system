'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/check` page
 * @module CheckPresenter
 */

const { formatLongDate } = require('../base.presenter.js')
const { returnRequirementReasons } = require('../../lib/static-lookups.lib.js')

function go (session) {
  const { id: sessionId, journey, licence, note, reason } = session

  return {
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

function _reasonLink (sessionId, journey) {
  if (journey === 'returns-required') {
    return `/system/return-requirements/${sessionId}/reason`
  }

  return `/system/return-requirements/${sessionId}/no-returns-required`
}

function _requirements (session) {
  const { requirements } = session

  const completedRequirements = []

  for (const requirement of requirements) {
    const { siteDescription, agreementsExceptions } = requirement
    if (agreementsExceptions) {
      completedRequirements.push({ siteDescription })
    }
  }

  return completedRequirements
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
