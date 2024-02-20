'use strict'

/**
 * Controller for /return-requirement endpoints
 * @module ReturnRequirementsController
 */

const NoReturnsRequiredService = require('../services/return-requirements/no-returns-required.service.js')
const SelectReasonService = require('../services/return-requirements/reason.service.js')
const SessionModel = require('../models/session.model.js')
const SetupService = require('../services/return-requirements/setup.service.js')
const StartDateService = require('../services/return-requirements/start-date.service.js')
const SubmitNoReturnsRequiredService = require('../services/return-requirements/submit-no-returns-required.service.js')
const SubmitReasonService = require('../services/return-requirements/submit-reason.service.js')
const SubmitSetupService = require('../services/return-requirements/submit-setup.service.js')
const SubmitStartDateService = require('../services/return-requirements/submit-start-date.service.js')

async function abstractionPeriod (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/abstraction-period.njk', {
    activeNavBar: 'search',
    pageTitle: 'Enter the abstraction period for the return requirement',
    ...session
  })
}

async function addNote (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/add-note.njk', {
    activeNavBar: 'search',
    pageTitle: 'Add a note',
    ...session
  })
}

async function agreementsExceptions (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/agreements-exceptions.njk', {
    activeNavBar: 'search',
    pageTitle: 'Select agreements and exceptions for the return requirement',
    ...session
  })
}

async function approved (request, h) {
  const { licenceId } = request.params

  return h.view('return-requirements/approved.njk', {
    activeNavBar: 'search',
    pageTitle: 'Returns requirements approved',
    licenceId
  })
}

async function checkYourAnswers (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/check-your-answers.njk', {
    activeNavBar: 'search',
    pageTitle: `Check the return requirements for ${session?.data?.licence?.licenceHolder}`,
    ...session
  })
}

async function existing (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/existing.njk', {
    activeNavBar: 'search',
    pageTitle: 'Select an existing return requirement from',
    ...session
  })
}

async function frequencyCollected (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/frequency-collected.njk', {
    activeNavBar: 'search',
    pageTitle: 'Select how often readings or volumes are collected',
    ...session
  })
}

async function frequencyReported (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/frequency-reported.njk', {
    activeNavBar: 'search',
    pageTitle: 'Select how often collected readings or volumes are reported',
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
    pageTitle: 'Select the points for the return requirement',
    ...session
  })
}

async function purpose (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/purpose.njk', {
    activeNavBar: 'search',
    pageTitle: 'Select the purpose for the return requirement',
    ...session
  })
}

async function reason (request, h) {
  const { sessionId } = request.params

  const pageData = await SelectReasonService.go(sessionId)

  return h.view('return-requirements/reason.njk', {
    ...pageData
  })
}

async function returnsCycle (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/returns-cycle.njk', {
    activeNavBar: 'search',
    pageTitle: 'Select the returns cycle for the return requirement',
    ...session
  })
}

async function setup (request, h) {
  const { sessionId } = request.params

  const pageData = await SetupService.go(sessionId)

  return h.view('return-requirements/setup.njk', {
    ...pageData
  })
}

async function siteDescription (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  return h.view('return-requirements/site-description.njk', {
    activeNavBar: 'search',
    pageTitle: 'Enter a site description for the return requirement',
    ...session
  })
}

async function startDate (request, h) {
  const { sessionId } = request.params

  const pageData = await StartDateService.go(sessionId)

  return h.view('return-requirements/start-date.njk', {
    ...pageData
  })
}

async function submitAbstractionPeriod (request, h) {
  const { sessionId } = request.params

  return h.redirect(`/system/return-requirements/${sessionId}/returns-cycle`)
}

async function submitAddNote (request, h) {
  const { sessionId } = request.params

  return h.redirect(`/system/return-requirements/${sessionId}/check-your-answers`)
}

async function submitAgreementsExceptions (request, h) {
  const { sessionId } = request.params

  return h.redirect(`/system/return-requirements/${sessionId}/check-your-answers`)
}

async function submitCheckYourAnswers (request, h) {
  const { sessionId } = request.params

  const session = await SessionModel.query().findById(sessionId)

  const { id: licenceId } = session.data.licence

  return h.redirect(`/system/return-requirements/${licenceId}/approved`)
}

async function submitExisting (request, h) {
  const { sessionId } = request.params

  return h.redirect(`/system/return-requirements/${sessionId}/check-your-answers`)
}

async function submitFrequencyCollected (request, h) {
  const { sessionId } = request.params

  return h.redirect(`/system/return-requirements/${sessionId}/frequency-reported`)
}

async function submitFrequencyReported (request, h) {
  const { sessionId } = request.params

  return h.redirect(`/system/return-requirements/${sessionId}/agreements-exceptions`)
}

async function submitNoReturnsRequired (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitNoReturnsRequiredService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/no-returns-required.njk', pageData)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/check-your-answers`)
}

async function submitPoints (request, h) {
  const { sessionId } = request.params

  return h.redirect(`/system/return-requirements/${sessionId}/abstraction-period`)
}

async function submitPurpose (request, h) {
  const { sessionId } = request.params

  return h.redirect(`/system/return-requirements/${sessionId}/points`)
}

async function submitReason (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitReasonService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/reason.njk', pageData)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/setup`)
}

async function submitReturnsCycle (request, h) {
  const { sessionId } = request.params

  return h.redirect(`/system/return-requirements/${sessionId}/site-description`)
}

async function submitSetup (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitSetupService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/setup.njk', pageData)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/purpose`)
}

async function submitSiteDescription (request, h) {
  const { sessionId } = request.params

  return h.redirect(`/system/return-requirements/${sessionId}/frequency-collected`)
}

async function submitStartDate (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitStartDateService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/start-date.njk', pageData)
  }

  if (pageData.journey === 'returns-required') {
    return h.redirect(`/system/return-requirements/${sessionId}/reason`)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/no-returns-required`)
}

module.exports = {
  abstractionPeriod,
  addNote,
  agreementsExceptions,
  approved,
  checkYourAnswers,
  existing,
  frequencyCollected,
  frequencyReported,
  noReturnsRequired,
  points,
  purpose,
  reason,
  returnsCycle,
  setup,
  siteDescription,
  startDate,
  submitAbstractionPeriod,
  submitAddNote,
  submitAgreementsExceptions,
  submitCheckYourAnswers,
  submitExisting,
  submitFrequencyCollected,
  submitFrequencyReported,
  submitNoReturnsRequired,
  submitPoints,
  submitPurpose,
  submitReason,
  submitReturnsCycle,
  submitSetup,
  submitSiteDescription,
  submitStartDate
}
