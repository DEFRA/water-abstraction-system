'use strict'

/**
 * Controller for /return-requirement endpoints
 * @module ReturnRequirementsController
 */

const NoReturnsRequiredService = require('../services/return-requirements/no-returns-required.service.js')
const NoReturnsRequiredValidator = require('../validators/return-requirements/no-returns-required.validator.js')
const SessionModel = require('../models/session.model.js')

async function selectReturnStartDate (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/select-return-start-date.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveReturnStartDate (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.redirect(`/system/return-requirements/${session.id}/reason`)
}

async function reasonNewRequirements (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/reason.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveReasonNewRequirements (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.redirect(`/system/return-requirements/${session.id}/how-do-you-want`)
}

async function howDoYouWant (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/how-do-you-want.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveHowDoYouWant (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.redirect(`/system/return-requirements/${session.id}/check-your-answers`)
}

async function checkYourAnswers (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/check-your-answers.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveCheckYourAnswers (request, h) {
  return h.redirect('/system/return-requirements/requirements-approved')
}

async function requirementsApproved (request, h) {
  return h.view('return-requirements/requirements-approved.njk', {
    activeNavBar: 'search'
  })
}

async function noReturnsRequired (request, h) {
  const { sessionId } = request.params

  const pageData = await NoReturnsRequiredService.go(sessionId)

  return h.view('return-requirements/no-returns-required.njk', {
    ...pageData
  })
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

async function noReturnsCheckYourAnswers (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/no-return-check-your-answers.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveNoReturnsCheckYourAnswers (request, h) {
  return h.redirect('/system/return-requirements/requirements-approved')
}

async function addANote (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/add-a-note.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveNote (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  const { id } = session

  return h.redirect(`/system/return-requirements/${id}/check-your-answers`)
}

async function returnsFrequencyCollected (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/frequency-collected.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveDescription (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/description.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function selectPoints (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/points.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function saveReturnsCycle (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/returns-cycle.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function returnsFrequency (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/frequency.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function returnsSettings (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/settings.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function selectPurpose (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/purpose.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function abstractionPeriod (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/abstraction-period.njk', {
    activeNavBar: 'search',
    ...session
  })
}

module.exports = {
  abstractionPeriod,
  addANote,
  noReturnsCheckYourAnswers,
  noReturnsRequired,
  reasonNewRequirements,
  requirementsApproved,
  checkYourAnswers,
  returnsSettings,
  howDoYouWant,
  returnsFrequencyCollected,
  saveDescription,
  returnsFrequency,
  saveNoReturnsCheckYourAnswers,
  saveNoReturnsRequired,
  saveNote,
  selectPurpose,
  saveReasonNewRequirements,
  saveCheckYourAnswers,
  saveReturnsCycle,
  saveHowDoYouWant,
  saveReturnStartDate,
  selectPoints,
  selectReturnStartDate
}
