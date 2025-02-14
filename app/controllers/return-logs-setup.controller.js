'use strict'

/**
 * Controller for /return-logs/setup endpoints
 * @module ReturnLogsSetupController
 */

const CancelService = require('../services/return-logs/setup/cancel.service.js')
const CheckService = require('../services/return-logs/setup/check.service.js')
const ConfirmReceivedService = require('../services/return-logs/setup/confirm-received.service.js')
const DeleteNoteService = require('../services/return-logs/setup/delete-note.service.js')
const InitiateSessionService = require('../services/return-logs/setup/initiate-session.service.js')
const MeterDetailsService = require('../services/return-logs/setup/meter-details.service.js')
const MeterProvidedService = require('../services/return-logs/setup/meter-provided.service.js')
const NoteService = require('../services/return-logs/setup/note.service.js')
const PeriodUsedService = require('../services/return-logs/setup/period-used.service.js')
const ReceivedService = require('../services/return-logs/setup/received.service.js')
const ReportedService = require('../services/return-logs/setup/reported.service.js')
const SingleVolumeService = require('../services/return-logs/setup/single-volume.service.js')
const SubmissionService = require('../services/return-logs/setup/submission.service.js')
const SubmitCancelService = require('../services/return-logs/setup/submit-cancel.service.js')
const SubmitMeterDetailsService = require('../services/return-logs/setup/submit-meter-details.service.js')
const SubmitMeterProvidedService = require('../services/return-logs/setup/submit-meter-provided.service.js')
const SubmitNoteService = require('../services/return-logs/setup/submit-note.service.js')
const SubmitPeriodUsedService = require('../services/return-logs/setup/submit-period-used.service.js')
const SubmitReceivedService = require('../services/return-logs/setup/submit-received.service.js')
const SubmitReportedService = require('../services/return-logs/setup/submit-reported.service.js')
const SubmitSingleVolumeService = require('../services/return-logs/setup/submit-single-volume.service.js')
const SubmitSubmissionService = require('../services/return-logs/setup/submit-submission.service.js')
const SubmitUnitsService = require('../services/return-logs/setup/submit-units.service.js')
const UnitsService = require('../services/return-logs/setup/units.service.js')

async function cancel(request, h) {
  const { sessionId } = request.params
  const pageData = await CancelService.go(sessionId)

  return h.view('return-logs/setup/cancel.njk', pageData)
}

async function check(request, h) {
  const { sessionId } = request.params
  const pageData = await CheckService.go(sessionId, request.yar)

  return h.view('return-logs/setup/check.njk', pageData)
}

async function confirmReceived(request, h) {
  const { id: returnLogId } = request.query
  const pageData = await ConfirmReceivedService.go(returnLogId)

  return h.view('return-logs/setup/confirm-received.njk', pageData)
}

async function deleteNote(request, h) {
  const { sessionId } = request.params

  await DeleteNoteService.go(sessionId, request.yar)

  return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
}

async function guidance(_request, h) {
  return h.view('return-logs/setup/guidance.njk')
}

async function meterDetails(request, h) {
  const { sessionId } = request.params
  const pageData = await MeterDetailsService.go(sessionId)

  return h.view('return-logs/setup/meter-details.njk', pageData)
}

async function meterProvided(request, h) {
  const { sessionId } = request.params
  const pageData = await MeterProvidedService.go(sessionId)

  return h.view('return-logs/setup/meter-provided.njk', pageData)
}

async function note(request, h) {
  const { sessionId } = request.params

  const pageData = await NoteService.go(sessionId)

  return h.view('return-logs/setup/note.njk', pageData)
}

async function periodUsed(request, h) {
  const { sessionId } = request.params
  const pageData = await PeriodUsedService.go(sessionId)

  return h.view('return-logs/setup/period-used.njk', pageData)
}

async function received(request, h) {
  const { sessionId } = request.params
  const pageData = await ReceivedService.go(sessionId)

  return h.view('return-logs/setup/received.njk', pageData)
}

async function reported(request, h) {
  const { sessionId } = request.params
  const pageData = await ReportedService.go(sessionId)

  return h.view('return-logs/setup/reported.njk', pageData)
}

async function setup(request, h) {
  const { returnLogId } = request.query
  const session = await InitiateSessionService.go(returnLogId)

  return h.redirect(`/system/return-logs/setup/${session.id}/received`)
}

async function singleVolume(request, h) {
  const { sessionId } = request.params
  const pageData = await SingleVolumeService.go(sessionId)

  return h.view('return-logs/setup/single-volume.njk', pageData)
}

async function submission(request, h) {
  const { sessionId } = request.params
  const pageData = await SubmissionService.go(sessionId)

  return h.view('return-logs/setup/submission.njk', pageData)
}

async function submitCancel(request, h) {
  const { sessionId } = request.params
  const { returnLogId } = request.payload

  await SubmitCancelService.go(sessionId)

  return h.redirect(`/system/return-logs?id=${returnLogId}`)
}

async function submitMeterDetails(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitMeterDetailsService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-logs/setup/meter-details.njk', pageData)
  }

  if (pageData.reported === 'abstraction-volumes' && !pageData.checkPageVisited) {
    return h.redirect(`/system/return-logs/setup/${sessionId}/single-volume`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
}

async function submitMeterProvided(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitMeterProvidedService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-logs/setup/meter-provided.njk', pageData)
  }

  if (pageData.meterProvided === 'no') {
    if (pageData.checkPageVisited || pageData.reported === 'meter-readings') {
      return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
    }

    return h.redirect(`/system/return-logs/setup/${sessionId}/single-volume`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/meter-details`)
}

async function submitNote(request, h) {
  const { sessionId } = request.params
  const { user } = request.auth.credentials

  const pageData = await SubmitNoteService.go(sessionId, request.payload, user, request.yar)

  if (pageData.error) {
    return h.view('return-logs/setup/note.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
}

async function submitPeriodUsed(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitPeriodUsedService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-logs/setup/period-used.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
}

async function submitReceived(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitReceivedService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-logs/setup/received.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/submission`)
}

async function submitReported(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitReportedService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-logs/setup/reported.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/units`)
}

async function submitSingleVolume(request, h) {
  const {
    params: { sessionId },
    payload
  } = request

  const pageData = await SubmitSingleVolumeService.go(sessionId, payload)

  if (pageData.error) {
    return h.view('return-logs/setup/single-volume.njk', pageData)
  }

  if (pageData.singleVolume === 'no') {
    return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/period-used`)
}

async function submitSubmission(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitSubmissionService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-logs/setup/submission.njk', pageData)
  }

  if (pageData.redirect === 'confirm-received') {
    return h.redirect(`/system/return-logs/setup/confirm-received?id=${pageData.returnLogId}`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/${pageData.redirect}`)
}

async function submitUnits(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitUnitsService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-logs/setup/units.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/meter-provided`)
}

async function units(request, h) {
  const { sessionId } = request.params
  const pageData = await UnitsService.go(sessionId)

  return h.view('return-logs/setup/units.njk', pageData)
}

module.exports = {
  cancel,
  check,
  confirmReceived,
  deleteNote,
  guidance,
  meterDetails,
  meterProvided,
  note,
  periodUsed,
  received,
  reported,
  setup,
  singleVolume,
  submission,
  submitCancel,
  submitMeterDetails,
  submitMeterProvided,
  submitNote,
  submitPeriodUsed,
  submitReceived,
  submitReported,
  submitSingleVolume,
  submitSubmission,
  submitUnits,
  units
}
