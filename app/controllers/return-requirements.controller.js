'use strict'

/**
 * Controller for /return-requirement endpoints
 * @module ReturnRequirementsController
 */

const NoReturnsRequiredService = require('../services/return-requirements/no-returns-required.service.js')
const NoReturnsRequiredValidator = require('../validators/return-requirements/no-returns-required.validator.js')
const SessionModel = require('../models/session.model.js')

async function abstractionPeriod (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/abstraction-period.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function addNote (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/add-note.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function agreementsExceptions (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/agreements-exceptions.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function approved (request, h) {
  return h.view('return-requirements/approved.njk', {
    activeNavBar: 'search'
  })
}

async function checkYourAnswers (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/check-your-answers.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function frequencyCollected (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/frequency-collected.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function frequencyReported (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/frequency-reported.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function noReturnsCheckYourAnswers (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/no-returns-check-your-answers.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function noReturnsRequired (request, h) {
  const { sessionId } = request.params

  const pageData = await NoReturnsRequiredService.go(sessionId)

  return h.view('return-requirements/no-returns-required.njk', {
    ...pageData
  })
}

async function points (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/points.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function purpose (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/purpose.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function reason (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/reason.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function returnsCycle (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/returns-cycle.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function setup (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/setup.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function siteDescription (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/site-description.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function startDate (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/start-date.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveAbstractionPeriod (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/abstraction-period.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveAddNote (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  const { id } = session

  return h.redirect(`/system/return-requirements/${id}/check-your-answers`)
}

async function saveAgreementsExceptions (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/agreements-exceptions.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveCheckYourAnswers (request, h) {
  return h.redirect('/system/return-requirements/approved')
}

async function saveFrequencyCollected (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/frequency-collected.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveFrequencyReported (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/frequency-reported.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveNoReturnsCheckYourAnswers (request, h) {
  return h.redirect('/system/return-requirements/approved')
}

async function saveNoReturnsRequired (request, h) {
  const { sessionId } = request.params
  const validation = NoReturnsRequiredValidator.go(request.payload)

  if (validation.error) {
    const pageData = await NoReturnsRequiredService.go(sessionId, validation.error)
    return h.view('return-requirements/no-returns-required.njk', pageData)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/check-your-answers`)
}

async function savePoints (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/points.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function savePurpose (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/purpose.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveReason (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.redirect(`/system/return-requirements/${session.id}/setup`)
}

async function saveReturnsCycle (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/returns-cycle.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveSetup (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.redirect(`/system/return-requirements/${session.id}/check-your-answers`)
}

async function saveSiteDescription (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/site-description.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveStartDate (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.redirect(`/system/return-requirements/${session.id}/reason`)
}

module.exports = {
  abstractionPeriod,
  addNote,
  agreementsExceptions,
  approved,
  checkYourAnswers,
  frequencyCollected,
  frequencyReported,
  noReturnsCheckYourAnswers,
  noReturnsRequired,
  points,
  purpose,
  reason,
  returnsCycle,
  setup,
  siteDescription,
  startDate,
  saveAbstractionPeriod,
  saveAddNote,
  saveAgreementsExceptions,
  saveCheckYourAnswers,
  saveFrequencyCollected,
  saveFrequencyReported,
  saveNoReturnsCheckYourAnswers,
  saveNoReturnsRequired,
  savePoints,
  savePurpose,
  saveReason,
  saveReturnsCycle,
  saveSetup,
  saveSiteDescription,
  saveStartDate
}
