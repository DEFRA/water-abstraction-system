'use strict'

/**
 * Controller for /return-requirement endpoints
 * @module ReturnRequirementsController
 */

const SessionModel = require('../models/session.model.js')

async function noReturnsRequired (request, h) {
  const { sessionId } = request.params

  const session = SessionModel.query().findById(sessionId)

  return h.view('return-requirements/no-returns-required.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function selectReturnStartDate (request, h) {
  const { sessionId } = request.params

  const session = SessionModel.query().findById(sessionId)

  return h.view('return-requirements/select-return-start-date.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function requirementsApproved (request, h) {
  const { sessionId } = request.params

  const session = SessionModel.query().findById(sessionId)

  return h.view('return-requirements/requirements-approved.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function noReturnsCheckYourAnswers (request, h) {
  const { sessionId } = request.params

  const session = SessionModel.query().findById(sessionId)

  return h.view('return-requirements/no-return-check-your-answers.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function returnsCheckYourAnswers (request, h) {
  const { sessionId } = request.params

  const session = SessionModel.query().findById(sessionId)

  return h.view('return-requirements/returns-check-your-answers.njk', {
    activeNavBar: 'search',
    ...session
  })
}

async function addANote (request, h) {
  const { sessionId } = request.params

  const session = SessionModel.query().findById(sessionId)

  return h.view('return-requirements/add-a-note.njk', {
    activeNavBar: 'search',
    ...session
  })
}

module.exports = {
  addANote,
  noReturnsCheckYourAnswers,
  noReturnsRequired,
  requirementsApproved,
  returnsCheckYourAnswers,
  selectReturnStartDate
}
