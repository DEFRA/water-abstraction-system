'use strict'

/**
 * Controller for /return-requirement/setup endpoints
 * @module ReturnRequirementsSetupController
 */

const AbstractionPeriodService = require('../services/return-requirements/setup/abstraction-period.service.js')
const AddService = require('../services/return-requirements/setup/add.service.js')
const AdditionalSubmissionOptionsService = require('../services/return-requirements/setup/additional-submission-options.service.js')
const AgreementsExceptionsService = require('../services/return-requirements/setup/agreements-exceptions.service.js')
const CancelService = require('../services/return-requirements/setup/cancel.service.js')
const CheckService = require('../services/return-requirements/setup/check.service.js')
const DeleteNoteService = require('../services/return-requirements/setup/delete-note.service.js')
const ExistingService = require('../services/return-requirements/setup/existing.service.js')
const FeatureFlagsConfig = require('../../config/feature-flags.config.js')
const FrequencyCollectedService = require('../services/return-requirements/setup/frequency-collected.service.js')
const FrequencyReportedService = require('../services/return-requirements/setup/frequency-reported.service.js')
const MethodService = require('../services/return-requirements/setup/method/method.service.js')
const NoReturnsRequiredService = require('../services/return-requirements/setup/no-returns-required.service.js')
const NoteService = require('../services/return-requirements/setup/note.service.js')
const PointsService = require('../services/return-requirements/setup/points.service.js')
const RemoveService = require('../services/return-requirements/setup/remove.service.js')
const ReturnsCycleService = require('../services/return-requirements/setup/returns-cycle.service.js')
const SelectPurposeService = require('../services/return-requirements/setup/purpose.service.js')
const SelectReasonService = require('../services/return-requirements/setup/reason.service.js')
const SiteDescriptionService = require('../services/return-requirements/setup/site-description.service.js')
const StartDateService = require('../services/return-requirements/setup/start-date.service.js')
const SubmitAbstractionPeriod = require('../services/return-requirements/setup/submit-abstraction-period.service.js')
const SubmitAdditionalSubmissionOptionsService = require('../services/return-requirements/setup/submit-additional-submission-options.service.js')
const SubmitAgreementsExceptions = require('../services/return-requirements/setup/submit-agreements-exceptions.service.js')
const SubmitCancel = require('../services/return-requirements/setup/submit-cancel.service.js')
const SubmitCheckService = require('../services/return-requirements/setup/submit-check.service.js')
const SubmitExistingService = require('../services/return-requirements/setup/submit-existing.service.js')
const SubmitFrequencyCollectedService = require('../services/return-requirements/setup/submit-frequency-collected.service.js')
const SubmitFrequencyReportedService = require('../services/return-requirements/setup/submit-frequency-reported.service.js')
const SubmitMethodService = require('../services/return-requirements/setup/method/submit-method.service.js')
const SubmitNoReturnsRequiredService = require('../services/return-requirements/setup/submit-no-returns-required.service.js')
const SubmitNoteService = require('../services/return-requirements/setup/submit-note.service.js')
const SubmitPointsService = require('../services/return-requirements/setup/submit-points.service.js')
const SubmitPurposeService = require('../services/return-requirements/setup/submit-purpose.service.js')
const SubmitReasonService = require('../services/return-requirements/setup/submit-reason.service.js')
const SubmitRemoveService = require('../services/return-requirements/setup/submit-remove.service.js')
const SubmitReturnsCycleService = require('../services/return-requirements/setup/submit-returns-cycle.service.js')
const SubmitSiteDescriptionService = require('../services/return-requirements/setup/submit-site-description.service.js')
const SubmitStartDateService = require('../services/return-requirements/setup/submit-start-date.service.js')

async function abstractionPeriod (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await AbstractionPeriodService.go(sessionId, requirementIndex)

  return h.view('return-requirements/setup/abstraction-period.njk', {
    ...pageData
  })
}

async function add (request, h) {
  const { sessionId } = request.params

  const requirementIndex = await AddService.go(sessionId)

  return h.redirect(`/system/return-requirements/setup/${sessionId}/purpose/${requirementIndex}`)
}

async function additionalSubmissionOptions (request, h) {
  const { sessionId } = request.params

  const pageData = await AdditionalSubmissionOptionsService.go(sessionId)

  return h.view('return-requirements/setup/additional-submission-options.njk', {
    ...pageData
  })
}

async function agreementsExceptions (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await AgreementsExceptionsService.go(sessionId, requirementIndex)

  return h.view('return-requirements/setup/agreements-exceptions.njk', {
    ...pageData
  })
}

async function approved (request, h) {
  const { licenceId } = request.params

  return h.view('return-requirements/setup/approved.njk', {
    activeNavBar: 'search',
    pageTitle: 'Requirements for returns approved',
    licenceId
  })
}

async function cancel (request, h) {
  const { sessionId } = request.params
  const pageData = await CancelService.go(sessionId)

  return h.view('return-requirements/setup/cancel.njk', {
    ...pageData
  })
}

async function check (request, h) {
  const { sessionId } = request.params
  const pageData = await CheckService.go(sessionId, request.yar)

  return h.view('return-requirements/setup/check.njk', {
    ...pageData
  })
}

async function deleteNote (request, h) {
  const { sessionId } = request.params

  await DeleteNoteService.go(sessionId, request.yar)

  return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
}

async function existing (request, h) {
  const { sessionId } = request.params

  const pageData = await ExistingService.go(sessionId)

  return h.view('return-requirements/setup/existing.njk', {
    ...pageData
  })
}

async function frequencyCollected (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await FrequencyCollectedService.go(sessionId, requirementIndex)

  return h.view('return-requirements/setup/frequency-collected.njk', {
    ...pageData
  })
}

async function frequencyReported (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await FrequencyReportedService.go(sessionId, requirementIndex)

  return h.view('return-requirements/setup/frequency-reported.njk', {
    ...pageData
  })
}

async function method (request, h) {
  const { sessionId } = request.params

  const pageData = await MethodService.go(sessionId)

  return h.view('return-requirements/setup/method.njk', {
    ...pageData
  })
}

async function noReturnsRequired (request, h) {
  const { sessionId } = request.params

  const pageData = await NoReturnsRequiredService.go(sessionId)

  return h.view('return-requirements/setup/no-returns-required.njk', {
    ...pageData
  })
}

async function note (request, h) {
  const { sessionId } = request.params

  const pageData = await NoteService.go(sessionId)

  return h.view('return-requirements/setup/note.njk', {
    ...pageData
  })
}

async function points (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await PointsService.go(sessionId, requirementIndex)

  return h.view('return-requirements/setup/points.njk', {
    ...pageData
  })
}

async function purpose (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await SelectPurposeService.go(sessionId, requirementIndex)

  return h.view('return-requirements/setup/purpose.njk', {
    ...pageData
  })
}

async function reason (request, h) {
  const { sessionId } = request.params

  const pageData = await SelectReasonService.go(sessionId)

  return h.view('return-requirements/setup/reason.njk', {
    ...pageData
  })
}

async function remove (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await RemoveService.go(sessionId, requirementIndex)

  return h.view('return-requirements/setup/remove.njk', {
    ...pageData
  })
}

async function returnsCycle (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await ReturnsCycleService.go(sessionId, requirementIndex)

  return h.view('return-requirements/setup/returns-cycle.njk', {
    ...pageData
  })
}

async function siteDescription (request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await SiteDescriptionService.go(sessionId, requirementIndex)

  return h.view('return-requirements/setup/site-description.njk', {
    ...pageData
  })
}

async function startDate (request, h) {
  const { sessionId } = request.params

  const pageData = await StartDateService.go(sessionId)

  return h.view('return-requirements/setup/start-date.njk', {
    ...pageData
  })
}

async function submitAbstractionPeriod (request, h) {
  const { params: { requirementIndex, sessionId }, payload, yar } = request

  const pageData = await SubmitAbstractionPeriod.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-requirements/setup/abstraction-period.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/setup/${sessionId}/returns-cycle/${requirementIndex}`)
}

async function submitAgreementsExceptions (request, h) {
  const { params: { requirementIndex, sessionId }, payload, yar } = request

  const pageData = await SubmitAgreementsExceptions.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-requirements/setup/agreements-exceptions.njk', pageData)
  }

  return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
}

async function submitAdditionalSubmissionOptions (request, h) {
  const { params: { sessionId }, payload, yar } = request

  const pageData = await SubmitAdditionalSubmissionOptionsService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-requirements/setup/additional-submission-options.njk', pageData)
  }

  return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
}

async function submitCancel (request, h) {
  const { sessionId } = request.params
  const { licenceId } = request.payload

  await SubmitCancel.go(sessionId)

  if (FeatureFlagsConfig.enableSystemLicenceView) {
    return h.redirect(`/system/licences/${licenceId}/set-up`)
  } else {
    return h.redirect(`/licences/${licenceId}#charge`)
  }
}

async function submitCheck (request, h) {
  const { sessionId } = request.params
  const { id: userId } = request.auth.credentials.user

  const licenceId = await SubmitCheckService.go(sessionId, userId)

  return h.redirect(`/system/return-requirements/setup/${licenceId}/approved`)
}

async function submitExisting (request, h) {
  const { params: { sessionId }, payload } = request

  const pageData = await SubmitExistingService.go(sessionId, payload)

  if (pageData.error) {
    return h.view('return-requirements/setup/existing.njk', pageData)
  }

  return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
}

async function submitFrequencyCollected (request, h) {
  const { params: { requirementIndex, sessionId }, payload, yar } = request

  const pageData = await SubmitFrequencyCollectedService.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-requirements/setup/frequency-collected.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/setup/${sessionId}/frequency-reported/${requirementIndex}`)
}

async function submitFrequencyReported (request, h) {
  const { params: { requirementIndex, sessionId }, payload, yar } = request

  const pageData = await SubmitFrequencyReportedService.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-requirements/setup/frequency-reported.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/setup/${sessionId}/agreements-exceptions/${requirementIndex}`)
}

async function submitMethod (request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitMethodService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-requirements/setup/method.njk', pageData)
  }

  return h.redirect(`/system/return-requirements/setup/${sessionId}/${pageData.redirect}`)
}

async function submitNoReturnsRequired (request, h) {
  const { params: { sessionId }, payload, yar } = request

  const pageData = await SubmitNoReturnsRequiredService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-requirements/setup/no-returns-required.njk', pageData)
  }

  return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
}

async function submitNote (request, h) {
  const { sessionId } = request.params
  const { user } = request.auth.credentials

  const pageData = await SubmitNoteService.go(sessionId, request.payload, user, request.yar)

  if (pageData.error) {
    return h.view('return-requirements/setup/note.njk', pageData)
  }

  return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
}

async function submitPoints (request, h) {
  const { params: { requirementIndex, sessionId }, payload, yar } = request

  const pageData = await SubmitPointsService.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-requirements/setup/points.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/setup/${sessionId}/abstraction-period/${requirementIndex}`)
}

async function submitPurpose (request, h) {
  const { params: { requirementIndex, sessionId }, payload, yar } = request

  const pageData = await SubmitPurposeService.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-requirements/setup/purpose.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/setup/${sessionId}/points/${requirementIndex}`)
}

async function submitReason (request, h) {
  const { params: { sessionId }, payload, yar } = request

  const pageData = await SubmitReasonService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-requirements/setup/reason.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/setup/${sessionId}/method`)
}

async function submitRemove (request, h) {
  const { requirementIndex, sessionId } = request.params

  await SubmitRemoveService.go(sessionId, requirementIndex, request.yar)

  return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
}

async function submitReturnsCycle (request, h) {
  const { params: { requirementIndex, sessionId }, payload, yar } = request

  const pageData = await SubmitReturnsCycleService.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-requirements/setup/returns-cycle.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/setup/${sessionId}/site-description/${requirementIndex}`)
}

async function submitSiteDescription (request, h) {
  const { params: { requirementIndex, sessionId }, payload, yar } = request

  const pageData = await SubmitSiteDescriptionService.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-requirements/setup/site-description.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-requirements/setup/${sessionId}/frequency-collected/${requirementIndex}`)
}

async function submitStartDate (request, h) {
  const { params: { sessionId }, payload, yar } = request

  const pageData = await SubmitStartDateService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-requirements/setup/start-date.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-requirements/setup/${sessionId}/check`)
  }

  if (pageData.journey === 'returns-required') {
    return h.redirect(`/system/return-requirements/setup/${sessionId}/reason`)
  }

  return h.redirect(`/system/return-requirements/setup/${sessionId}/no-returns-required`)
}

module.exports = {
  abstractionPeriod,
  add,
  additionalSubmissionOptions,
  agreementsExceptions,
  approved,
  cancel,
  check,
  deleteNote,
  existing,
  frequencyCollected,
  frequencyReported,
  method,
  noReturnsRequired,
  note,
  points,
  purpose,
  reason,
  remove,
  returnsCycle,
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
  submitMethod,
  submitNoReturnsRequired,
  submitNote,
  submitPoints,
  submitPurpose,
  submitReason,
  submitRemove,
  submitReturnsCycle,
  submitSiteDescription,
  submitStartDate
}
