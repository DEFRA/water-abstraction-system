'use strict'

/**
 * Controller for /return-versions/setup endpoints
 * @module ReturnVersionsSetupController
 */

const AbstractionPeriodService = require('../services/return-versions/setup/abstraction-period.service.js')
const AddService = require('../services/return-versions/setup/add.service.js')
const AdditionalSubmissionOptionsService = require('../services/return-versions/setup/additional-submission-options.service.js')
const AgreementsExceptionsService = require('../services/return-versions/setup/agreements-exceptions.service.js')
const CancelService = require('../services/return-versions/setup/cancel.service.js')
const CheckService = require('../services/return-versions/setup/check/check.service.js')
const DeleteNoteService = require('../services/return-versions/setup/delete-note.service.js')
const ExistingService = require('../services/return-versions/setup/existing/existing.service.js')
const FeatureFlagsConfig = require('../../config/feature-flags.config.js')
const FrequencyCollectedService = require('../services/return-versions/setup/frequency-collected.service.js')
const FrequencyReportedService = require('../services/return-versions/setup/frequency-reported.service.js')
const MethodService = require('../services/return-versions/setup/method/method.service.js')
const NoReturnsRequiredService = require('../services/return-versions/setup/no-returns-required.service.js')
const NoteService = require('../services/return-versions/setup/note.service.js')
const PointsService = require('../services/return-versions/setup/points.service.js')
const RemoveService = require('../services/return-versions/setup/remove.service.js')
const ReturnsCycleService = require('../services/return-versions/setup/returns-cycle.service.js')
const SelectPurposeService = require('../services/return-versions/setup/purpose.service.js')
const SelectReasonService = require('../services/return-versions/setup/reason.service.js')
const SiteDescriptionService = require('../services/return-versions/setup/site-description.service.js')
const StartDateService = require('../services/return-versions/setup/start-date.service.js')
const SubmitAbstractionPeriod = require('../services/return-versions/setup/submit-abstraction-period.service.js')
const SubmitAdditionalSubmissionOptionsService = require('../services/return-versions/setup/submit-additional-submission-options.service.js')
const SubmitAgreementsExceptions = require('../services/return-versions/setup/submit-agreements-exceptions.service.js')
const SubmitCancel = require('../services/return-versions/setup/submit-cancel.service.js')
const SubmitCheckService = require('../services/return-versions/setup/check/submit-check.service.js')
const SubmitExistingService = require('../services/return-versions/setup/existing/submit-existing.service.js')
const SubmitFrequencyCollectedService = require('../services/return-versions/setup/submit-frequency-collected.service.js')
const SubmitFrequencyReportedService = require('../services/return-versions/setup/submit-frequency-reported.service.js')
const SubmitMethodService = require('../services/return-versions/setup/method/submit-method.service.js')
const SubmitNoReturnsRequiredService = require('../services/return-versions/setup/submit-no-returns-required.service.js')
const SubmitNoteService = require('../services/return-versions/setup/submit-note.service.js')
const SubmitPointsService = require('../services/return-versions/setup/submit-points.service.js')
const SubmitPurposeService = require('../services/return-versions/setup/submit-purpose.service.js')
const SubmitReasonService = require('../services/return-versions/setup/submit-reason.service.js')
const SubmitRemoveService = require('../services/return-versions/setup/submit-remove.service.js')
const SubmitReturnsCycleService = require('../services/return-versions/setup/submit-returns-cycle.service.js')
const SubmitSiteDescriptionService = require('../services/return-versions/setup/submit-site-description.service.js')
const SubmitStartDateService = require('../services/return-versions/setup/submit-start-date.service.js')

async function abstractionPeriod(request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await AbstractionPeriodService.go(sessionId, requirementIndex)

  return h.view('return-versions/setup/abstraction-period.njk', pageData)
}

async function add(request, h) {
  const { sessionId } = request.params

  const requirementIndex = await AddService.go(sessionId)

  return h.redirect(`/system/return-versions/setup/${sessionId}/purpose/${requirementIndex}`)
}

async function additionalSubmissionOptions(request, h) {
  const { sessionId } = request.params

  const pageData = await AdditionalSubmissionOptionsService.go(sessionId)

  return h.view('return-versions/setup/additional-submission-options.njk', pageData)
}

async function agreementsExceptions(request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await AgreementsExceptionsService.go(sessionId, requirementIndex)

  return h.view('return-versions/setup/agreements-exceptions.njk', pageData)
}

async function approved(request, h) {
  const { licenceId } = request.params

  return h.view('return-versions/setup/approved.njk', {
    activeNavBar: 'search',
    pageTitle: 'Requirements for returns approved',
    licenceId
  })
}

async function cancel(request, h) {
  const { sessionId } = request.params
  const pageData = await CancelService.go(sessionId)

  return h.view('return-versions/setup/cancel.njk', pageData)
}

async function check(request, h) {
  const { sessionId } = request.params
  const pageData = await CheckService.go(sessionId, request.yar)

  return h.view('return-versions/setup/check.njk', pageData)
}

async function deleteNote(request, h) {
  const { sessionId } = request.params

  await DeleteNoteService.go(sessionId, request.yar)

  return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
}

async function existing(request, h) {
  const { sessionId } = request.params

  const pageData = await ExistingService.go(sessionId)

  return h.view('return-versions/setup/existing.njk', pageData)
}

async function frequencyCollected(request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await FrequencyCollectedService.go(sessionId, requirementIndex)

  return h.view('return-versions/setup/frequency-collected.njk', pageData)
}

async function frequencyReported(request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await FrequencyReportedService.go(sessionId, requirementIndex)

  return h.view('return-versions/setup/frequency-reported.njk', pageData)
}

async function method(request, h) {
  const { sessionId } = request.params

  const pageData = await MethodService.go(sessionId)

  return h.view('return-versions/setup/method.njk', pageData)
}

async function noReturnsRequired(request, h) {
  const { sessionId } = request.params

  const pageData = await NoReturnsRequiredService.go(sessionId)

  return h.view('return-versions/setup/no-returns-required.njk', pageData)
}

async function note(request, h) {
  const { sessionId } = request.params

  const pageData = await NoteService.go(sessionId)

  return h.view('return-versions/setup/note.njk', pageData)
}

async function points(request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await PointsService.go(sessionId, requirementIndex)

  return h.view('return-versions/setup/points.njk', pageData)
}

async function purpose(request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await SelectPurposeService.go(sessionId, requirementIndex)

  return h.view('return-versions/setup/purpose.njk', pageData)
}

async function reason(request, h) {
  const { sessionId } = request.params

  const pageData = await SelectReasonService.go(sessionId)

  return h.view('return-versions/setup/reason.njk', pageData)
}

async function remove(request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await RemoveService.go(sessionId, requirementIndex)

  return h.view('return-versions/setup/remove.njk', pageData)
}

async function returnsCycle(request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await ReturnsCycleService.go(sessionId, requirementIndex)

  return h.view('return-versions/setup/returns-cycle.njk', pageData)
}

async function siteDescription(request, h) {
  const { requirementIndex, sessionId } = request.params

  const pageData = await SiteDescriptionService.go(sessionId, requirementIndex)

  return h.view('return-versions/setup/site-description.njk', pageData)
}

async function startDate(request, h) {
  const { sessionId } = request.params

  const pageData = await StartDateService.go(sessionId)

  return h.view('return-versions/setup/start-date.njk', pageData)
}

async function submitAbstractionPeriod(request, h) {
  const {
    params: { requirementIndex, sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitAbstractionPeriod.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-versions/setup/abstraction-period.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-versions/setup/${sessionId}/returns-cycle/${requirementIndex}`)
}

async function submitAgreementsExceptions(request, h) {
  const {
    params: { requirementIndex, sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitAgreementsExceptions.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-versions/setup/agreements-exceptions.njk', pageData)
  }

  return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
}

async function submitAdditionalSubmissionOptions(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitAdditionalSubmissionOptionsService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-versions/setup/additional-submission-options.njk', pageData)
  }

  return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
}

async function submitCancel(request, h) {
  const { sessionId } = request.params
  const { licenceId } = request.payload

  await SubmitCancel.go(sessionId)

  if (FeatureFlagsConfig.enableSystemLicenceView) {
    return h.redirect(`/system/licences/${licenceId}/set-up`)
  } else {
    return h.redirect(`/licences/${licenceId}#charge`)
  }
}

async function submitCheck(request, h) {
  const { sessionId } = request.params
  const { id: userId } = request.auth.credentials.user

  const licenceId = await SubmitCheckService.go(sessionId, userId)

  return h.redirect(`/system/return-versions/setup/${licenceId}/approved`)
}

async function submitExisting(request, h) {
  const {
    params: { sessionId },
    payload
  } = request

  const pageData = await SubmitExistingService.go(sessionId, payload)

  if (pageData.error) {
    return h.view('return-versions/setup/existing.njk', pageData)
  }

  return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
}

async function submitFrequencyCollected(request, h) {
  const {
    params: { requirementIndex, sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitFrequencyCollectedService.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-versions/setup/frequency-collected.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-versions/setup/${sessionId}/frequency-reported/${requirementIndex}`)
}

async function submitFrequencyReported(request, h) {
  const {
    params: { requirementIndex, sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitFrequencyReportedService.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-versions/setup/frequency-reported.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-versions/setup/${sessionId}/agreements-exceptions/${requirementIndex}`)
}

async function submitMethod(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitMethodService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-versions/setup/method.njk', pageData)
  }

  return h.redirect(`/system/return-versions/setup/${sessionId}/${pageData.redirect}`)
}

async function submitNoReturnsRequired(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitNoReturnsRequiredService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-versions/setup/no-returns-required.njk', pageData)
  }

  return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
}

async function submitNote(request, h) {
  const { sessionId } = request.params
  const { user } = request.auth.credentials

  const pageData = await SubmitNoteService.go(sessionId, request.payload, user, request.yar)

  if (pageData.error) {
    return h.view('return-versions/setup/note.njk', pageData)
  }

  return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
}

async function submitPoints(request, h) {
  const {
    params: { requirementIndex, sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitPointsService.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-versions/setup/points.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-versions/setup/${sessionId}/abstraction-period/${requirementIndex}`)
}

async function submitPurpose(request, h) {
  const {
    params: { requirementIndex, sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitPurposeService.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-versions/setup/purpose.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-versions/setup/${sessionId}/points/${requirementIndex}`)
}

async function submitReason(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitReasonService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-versions/setup/reason.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-versions/setup/${sessionId}/method`)
}

async function submitRemove(request, h) {
  const { requirementIndex, sessionId } = request.params

  await SubmitRemoveService.go(sessionId, requirementIndex, request.yar)

  return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
}

async function submitReturnsCycle(request, h) {
  const {
    params: { requirementIndex, sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitReturnsCycleService.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-versions/setup/returns-cycle.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-versions/setup/${sessionId}/site-description/${requirementIndex}`)
}

async function submitSiteDescription(request, h) {
  const {
    params: { requirementIndex, sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitSiteDescriptionService.go(sessionId, requirementIndex, payload, yar)

  if (pageData.error) {
    return h.view('return-versions/setup/site-description.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-versions/setup/${sessionId}/frequency-collected/${requirementIndex}`)
}

async function submitStartDate(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitStartDateService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-versions/setup/start-date.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-versions/setup/${sessionId}/check`)
  }

  if (pageData.journey === 'returns-required') {
    return h.redirect(`/system/return-versions/setup/${sessionId}/reason`)
  }

  return h.redirect(`/system/return-versions/setup/${sessionId}/no-returns-required`)
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
