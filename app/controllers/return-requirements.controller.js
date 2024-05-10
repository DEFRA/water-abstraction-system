'use strict'

/**
 * Controller for /return-requirement endpoints
 * @module ReturnRequirementsController
 */

const AbstractionPeriodService = require('../services/return-requirements/abstraction-period.service.js')
const AgreementsExceptionsService = require('../services/return-requirements/agreements-exceptions.service.js')
const CancelService = require('../services/return-requirements/cancel.service.js')
const CheckService = require('../services/return-requirements/check.service.js')
const AdditionalSubmissionOptionsService = require('../services/return-requirements/additional-submission-options.service.js')
const DeleteNoteService = require('../services/return-requirements/delete-note.service.js')
const FrequencyCollectedService = require('../services/return-requirements/frequency-collected.service.js')
const FrequencyReportedService = require('../services/return-requirements/frequency-reported.service.js')
const NoReturnsRequiredService = require('../services/return-requirements/no-returns-required.service.js')
const NoteService = require('../services/return-requirements/note.service.js')
const PointsService = require('../services/return-requirements/points.service.js')
const ReturnsCycleService = require('../services/return-requirements/returns-cycle.service.js')
const SelectPurposeService = require('../services/return-requirements/purpose.service.js')
const SelectReasonService = require('../services/return-requirements/reason.service.js')
const SessionModel = require('../models/session.model.js')
const SetupService = require('../services/return-requirements/setup.service.js')
const SiteDescriptionService = require('../services/return-requirements/site-description.service.js')
const StartDateService = require('../services/return-requirements/start-date.service.js')
const SubmitAbstractionPeriod = require('../services/return-requirements/submit-abstraction-period.service.js')
const SubmitAdditionalSubmissionOptionsService = require('../services/return-requirements/submit-additional-submission-options.service.js')
const SubmitAgreementsExceptions = require('../services/return-requirements/submit-agreements-exceptions.service.js')
const SubmitCancel = require('../services/return-requirements/submit-cancel.service.js')
const SubmitCheckService = require('../services/return-requirements/submit-check.service.js')
const SubmitFrequencyCollectedService = require('../services/return-requirements/submit-frequency-collected.service.js')
const SubmitFrequencyReportedService = require('../services/return-requirements/submit-frequency-reported.service.js')
const SubmitNoReturnsRequiredService = require('../services/return-requirements/submit-no-returns-required.service.js')
const SubmitNoteService = require('../services/return-requirements/submit-note.service.js')
const SubmitPointsService = require('../services/return-requirements/submit-points.service.js')
const SubmitPurposeService = require('../services/return-requirements/submit-purpose.service.js')
const SubmitReasonService = require('../services/return-requirements/submit-reason.service.js')
const SubmitReturnsCycleService = require('../services/return-requirements/submit-returns-cycle.service.js')
const SubmitSetupService = require('../services/return-requirements/submit-setup.service.js')
const SubmitSiteDescriptionService = require('../services/return-requirements/submit-site-description.service.js')
const SubmitStartDateService = require('../services/return-requirements/submit-start-date.service.js')

async function abstractionPeriod (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await AbstractionPeriodService.go(sessionId, requirementIndex)

  return h.view('return-requirements/abstraction-period.njk', {
    ...pageData
  })
}

async function additionalSubmissionOptions (request, h) {
  const { sessionId } = request.params

  const pageData = await AdditionalSubmissionOptionsService.go(sessionId)

  return h.view('return-requirements/additional-submission-options.njk', {
    ...pageData
  })
}

async function agreementsExceptions (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await AgreementsExceptionsService.go(sessionId, requirementIndex)

  return h.view('return-requirements/agreements-exceptions.njk', {
    ...pageData
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

async function cancel (request, h) {
  const { sessionId } = request.params
  const pageData = await CancelService.go(sessionId)

  return h.view('return-requirements/cancel.njk', {
    ...pageData
  })
}

async function check (request, h) {
  const { sessionId } = request.params
  const pageData = await CheckService.go(sessionId, request.yar)

  return h.view('return-requirements/check.njk', {
    ...pageData
  })
}

async function deleteNote (request, h) {
  const { sessionId } = request.params

  await DeleteNoteService.go(sessionId, request.yar)

  return h.redirect(`/system/return-requirements/${sessionId}/check`)
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
  const { requirementIndex, sessionId } = request.params

  const pageData = await FrequencyCollectedService.go(sessionId, requirementIndex)

  return h.view('return-requirements/frequency-collected.njk', {
    ...pageData
  })
}

async function frequencyReported (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await FrequencyReportedService.go(sessionId, requirementIndex)

  return h.view('return-requirements/frequency-reported.njk', {
    ...pageData
  })
}

async function noReturnsRequired (request, h) {
  const { sessionId } = request.params

  const pageData = await NoReturnsRequiredService.go(sessionId)

  return h.view('return-requirements/no-returns-required.njk', {
    ...pageData
  })
}

async function note (request, h) {
  const { sessionId } = request.params

  const pageData = await NoteService.go(sessionId)

  return h.view('return-requirements/note.njk', {
    ...pageData
  })
}

async function points (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await PointsService.go(sessionId, requirementIndex)

  return h.view('return-requirements/points.njk', {
    ...pageData
  })
}

async function purpose (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await SelectPurposeService.go(sessionId, requirementIndex)

  return h.view('return-requirements/purpose.njk', {
    ...pageData
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
  const { requirementIndex, sessionId } = request.params

  const pageData = await ReturnsCycleService.go(sessionId, requirementIndex)

  return h.view('return-requirements/returns-cycle.njk', {
    ...pageData
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
  const { requirementIndex, sessionId } = request.params

  const pageData = await SiteDescriptionService.go(sessionId, requirementIndex)

  return h.view('return-requirements/site-description.njk', {
    ...pageData
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
  const { requirementIndex, sessionId } = request.params

  const pageData = await SubmitAbstractionPeriod.go(sessionId, requirementIndex, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/abstraction-period.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/returns-cycle/${requirementIndex}`)
}

async function submitAgreementsExceptions (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await SubmitAgreementsExceptions.go(sessionId, requirementIndex, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/agreements-exceptions.njk', pageData)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/check`)
}

async function submitAdditionalSubmissionOptions (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitAdditionalSubmissionOptionsService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/additional-submission-options.njk', pageData)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/check-your-answers`)
}

async function submitCancel (request, h) {
  const { sessionId } = request.params
  const { licenceId } = request.payload

  await SubmitCancel.go(sessionId)

  return h.redirect(`/licences/${licenceId}#charge`)
}

async function submitCheck (request, h) {
  const { sessionId } = request.params

  const licenceId = await SubmitCheckService.go(sessionId)

  return h.redirect(`/system/return-requirements/${licenceId}/approved`)
}

async function submitExisting (request, h) {
  const { sessionId } = request.params

  return h.redirect(`/system/return-requirements/${sessionId}/check`)
}

async function submitFrequencyCollected (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await SubmitFrequencyCollectedService.go(sessionId, requirementIndex, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/frequency-collected.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/frequency-reported/${requirementIndex}`)
}

async function submitFrequencyReported (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await SubmitFrequencyReportedService.go(sessionId, requirementIndex, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/frequency-reported.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/agreements-exceptions/${requirementIndex}`)
}

async function submitNoReturnsRequired (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitNoReturnsRequiredService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/no-returns-required.njk', pageData)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/check`)
}

async function submitNote (request, h) {
  const { sessionId } = request.params
  const { user } = request.auth.credentials

  const pageData = await SubmitNoteService.go(sessionId, request.payload, user, request.yar)

  if (pageData.error) {
    return h.view('return-requirements/note.njk', pageData)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/check`)
}

async function submitPoints (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await SubmitPointsService.go(sessionId, requirementIndex, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/points.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/abstraction-period/${requirementIndex}`)
}

async function submitPurpose (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await SubmitPurposeService.go(sessionId, requirementIndex, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/purpose.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/points/${requirementIndex}`)
}

async function submitReason (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitReasonService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/reason.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/setup`)
}

async function submitReturnsCycle (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await SubmitReturnsCycleService.go(sessionId, requirementIndex, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/returns-cycle.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/site-description/${requirementIndex}`)
}

async function submitSetup (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitSetupService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/setup.njk', pageData)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/${pageData.redirect}`)
}

async function submitSiteDescription (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await SubmitSiteDescriptionService.go(sessionId, requirementIndex, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/site-description.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/frequency-collected/${requirementIndex}`)
}

async function submitStartDate (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitStartDateService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/start-date.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/${sessionId}/check`)
  }

  if (pageData.journey === 'returns-required') {
    return h.redirect(`/system/return-requirements/${sessionId}/reason`)
  }

  return h.redirect(`/system/return-requirements/${sessionId}/no-returns-required`)
}

module.exports = {
  abstractionPeriod,
  additionalSubmissionOptions,
  agreementsExceptions,
  approved,
  cancel,
  check,
  deleteNote,
  existing,
  frequencyCollected,
  frequencyReported,
  noReturnsRequired,
  note,
  points,
  purpose,
  reason,
  returnsCycle,
  setup,
  siteDescription,
  startDate,
  submitAbstractionPeriod,
  submitAdditionalSubmissionOptions,
  submitAgreementsExceptions,
  submitCancel,
  submitCheck,
  submitExisting,
  submitFrequencyCollected,
  submitFrequencyReported,
  submitNoReturnsRequired,
  submitNote,
  submitPoints,
  submitPurpose,
  submitReason,
  submitReturnsCycle,
  submitSetup,
  submitSiteDescription,
  submitStartDate
}
