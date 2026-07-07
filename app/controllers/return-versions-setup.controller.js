/**
 * Controller for /return-versions/setup endpoints
 * @module ReturnVersionsSetupController
 */

import AbstractionPeriodService from '../services/return-versions/setup/abstraction-period.service.js'
import AddService from '../services/return-versions/setup/add.service.js'
import AdditionalSubmissionOptionsService from '../services/return-versions/setup/additional-submission-options.service.js'
import AgreementsExceptionsService from '../services/return-versions/setup/agreements-exceptions.service.js'
import CancelService from '../services/return-versions/setup/cancel.service.js'
import CheckService from '../services/return-versions/setup/check/check.service.js'
import DeleteNoteService from '../services/return-versions/setup/delete-note.service.js'
import ExistingService from '../services/return-versions/setup/existing/existing.service.js'
import FrequencyCollectedService from '../services/return-versions/setup/frequency-collected.service.js'
import FrequencyReportedService from '../services/return-versions/setup/frequency-reported.service.js'
import MethodService from '../services/return-versions/setup/method/method.service.js'
import NoReturnsRequiredService from '../services/return-versions/setup/no-returns-required.service.js'
import NoteService from '../services/return-versions/setup/note.service.js'
import PointsService from '../services/return-versions/setup/points.service.js'
import RemoveService from '../services/return-versions/setup/remove.service.js'
import ReturnsCycleService from '../services/return-versions/setup/returns-cycle.service.js'
import SelectPurposeService from '../services/return-versions/setup/purpose.service.js'
import SelectReasonService from '../services/return-versions/setup/reason.service.js'
import SiteDescriptionService from '../services/return-versions/setup/site-description.service.js'
import StartDateService from '../services/return-versions/setup/start-date.service.js'
import SubmitAbstractionPeriod from '../services/return-versions/setup/submit-abstraction-period.service.js'
import SubmitAdditionalSubmissionOptionsService from '../services/return-versions/setup/submit-additional-submission-options.service.js'
import SubmitAgreementsExceptions from '../services/return-versions/setup/submit-agreements-exceptions.service.js'
import SubmitCancel from '../services/return-versions/setup/submit-cancel.service.js'
import SubmitCheckService from '../services/return-versions/setup/check/submit-check.service.js'
import SubmitExistingService from '../services/return-versions/setup/existing/submit-existing.service.js'
import SubmitFrequencyCollectedService from '../services/return-versions/setup/submit-frequency-collected.service.js'
import SubmitFrequencyReportedService from '../services/return-versions/setup/submit-frequency-reported.service.js'
import SubmitMethodService from '../services/return-versions/setup/method/submit-method.service.js'
import SubmitNoReturnsRequiredService from '../services/return-versions/setup/submit-no-returns-required.service.js'
import SubmitNoteService from '../services/return-versions/setup/submit-note.service.js'
import SubmitPointsService from '../services/return-versions/setup/submit-points.service.js'
import SubmitPurposeService from '../services/return-versions/setup/submit-purpose.service.js'
import SubmitReasonService from '../services/return-versions/setup/submit-reason.service.js'
import SubmitRemoveService from '../services/return-versions/setup/submit-remove.service.js'
import SubmitReturnsCycleService from '../services/return-versions/setup/submit-returns-cycle.service.js'
import SubmitSiteDescriptionService from '../services/return-versions/setup/submit-site-description.service.js'
import SubmitStartDateService from '../services/return-versions/setup/submit-start-date.service.js'

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

  return h.redirect(`/system/licences/${licenceId}/set-up`)
}

async function submitCheck(request, h) {
  const { sessionId } = request.params
  const { userId } = request.auth.credentials.user

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

export {
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
export default {
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
