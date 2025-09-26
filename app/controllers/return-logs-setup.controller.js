'use strict'

/**
 * Controller for /return-logs/setup endpoints
 * @module ReturnLogsSetupController
 */

const CancelService = require('../services/return-logs/setup/cancel.service.js')
const CheckService = require('../services/return-logs/setup/check.service.js')
const ConfirmedService = require('../services/return-logs/setup/confirmed.service.js')
const DeleteNoteService = require('../services/return-logs/setup/delete-note.service.js')
const InitiateSessionService = require('../services/return-logs/setup/initiate-session.service.js')
const MeterDetailsService = require('../services/return-logs/setup/meter-details.service.js')
const MeterProvidedService = require('../services/return-logs/setup/meter-provided.service.js')
const MultipleEntriesService = require('../services/return-logs/setup/multiple-entries.service.js')
const NoteService = require('../services/return-logs/setup/note.service.js')
const PeriodUsedService = require('../services/return-logs/setup/period-used.service.js')
const ReadingsService = require('../services/return-logs/setup/readings.service.js')
const ReceivedService = require('../services/return-logs/setup/received.service.js')
const ReportedService = require('../services/return-logs/setup/reported.service.js')
const SingleVolumeService = require('../services/return-logs/setup/single-volume.service.js')
const StartReadingService = require('../services/return-logs/setup/start-reading.service.js')
const SubmissionService = require('../services/return-logs/setup/submission.service.js')
const SubmitConfirmedService = require('../services/return-logs/setup/submit-confirmed.service.js')
const SubmitCancelService = require('../services/return-logs/setup/submit-cancel.service.js')
const SubmitCheckService = require('../services/return-logs/setup/submit-check.service.js')
const SubmitMeterDetailsService = require('../services/return-logs/setup/submit-meter-details.service.js')
const SubmitMeterProvidedService = require('../services/return-logs/setup/submit-meter-provided.service.js')
const SubmitMultipleEntriesService = require('../services/return-logs/setup/submit-multiple-entries.service.js')
const SubmitNoteService = require('../services/return-logs/setup/submit-note.service.js')
const SubmitPeriodUsedService = require('../services/return-logs/setup/submit-period-used.service.js')
const SubmitReadingsService = require('../services/return-logs/setup/submit-readings.service.js')
const SubmitReceivedService = require('../services/return-logs/setup/submit-received.service.js')
const SubmitReportedService = require('../services/return-logs/setup/submit-reported.service.js')
const SubmitSingleVolumeService = require('../services/return-logs/setup/submit-single-volume.service.js')
const SubmitStartReadingService = require('../services/return-logs/setup/submit-start-reading.service.js')
const SubmitSubmissionService = require('../services/return-logs/setup/submit-submission.service.js')
const SubmitUnitsService = require('../services/return-logs/setup/submit-units.service.js')
const SubmitVolumesService = require('../services/return-logs/setup/submit-volumes.service.js')
const UnitsService = require('../services/return-logs/setup/units.service.js')
const VolumesService = require('../services/return-logs/setup/volumes.service.js')

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

async function confirmed(request, h) {
  const { id: returnLogId } = request.query
  const pageData = await ConfirmedService.go(returnLogId)

  return h.view('return-logs/setup/confirmed.njk', pageData)
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

async function multipleEntries(request, h) {
  const { sessionId } = request.params
  const pageData = await MultipleEntriesService.go(sessionId)

  return h.view('return-logs/setup/multiple-entries.njk', pageData)
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

async function readings(request, h) {
  const { sessionId, yearMonth } = request.params
  const pageData = await ReadingsService.go(sessionId, yearMonth)

  return h.view('return-logs/setup/readings.njk', pageData)
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

async function singleVolume(request, h) {
  const { sessionId } = request.params
  const pageData = await SingleVolumeService.go(sessionId)

  return h.view('return-logs/setup/single-volume.njk', pageData)
}

async function startReading(request, h) {
  const { sessionId } = request.params

  const pageData = await StartReadingService.go(sessionId)

  return h.view('return-logs/setup/start-reading.njk', pageData)
}

async function submission(request, h) {
  const { sessionId } = request.params
  const pageData = await SubmissionService.go(sessionId)

  return h.view('return-logs/setup/submission.njk', pageData)
}

async function submitConfirmed(request, h) {
  const { id: returnLogId } = request.query

  const licenceId = await SubmitConfirmedService.go(returnLogId)

  return h.redirect(`/system/licences/${licenceId}/returns`)
}

async function submitCancel(request, h) {
  const { sessionId } = request.params
  const { returnLogId } = request.payload

  await SubmitCancelService.go(sessionId)

  return h.redirect(`/system/return-logs?id=${returnLogId}`)
}

async function submitCheck(request, h) {
  const { sessionId } = request.params
  const { user } = request.auth.credentials

  const pageData = await SubmitCheckService.go(sessionId, user)

  if (pageData.error) {
    return h.view('return-logs/setup/check.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/confirmed?id=${pageData.returnLogId}`)
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

  if (pageData.reported === 'abstractionVolumes' && !pageData.checkPageVisited) {
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
    if (pageData.checkPageVisited || pageData.reported === 'meterReadings') {
      return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
    }

    return h.redirect(`/system/return-logs/setup/${sessionId}/single-volume`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/meter-details`)
}

async function submitMultipleEntries(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitMultipleEntriesService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-logs/setup/multiple-entries.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
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

async function submitReadings(request, h) {
  const {
    params: { sessionId, yearMonth },
    payload,
    yar
  } = request

  const pageData = await SubmitReadingsService.go(sessionId, payload, yar, yearMonth)

  if (pageData.error) {
    return h.view('return-logs/setup/readings.njk', pageData)
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

  // If the user has selected 'Meter readings' we always redirect to the start-reading page
  if (pageData.reported === 'meterReadings') {
    return h.redirect(`/system/return-logs/setup/${sessionId}/start-reading`)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/units`)
}

async function submitSetup(request, h) {
  const { returnLogId } = request.payload

  const redirectUrl = await InitiateSessionService.go(returnLogId)

  return h.redirect(redirectUrl)
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

async function submitStartReading(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitStartReadingService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-logs/setup/start-reading.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/units`)
}

async function submitSubmission(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitSubmissionService.go(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-logs/setup/submission.njk', pageData)
  }

  // NOTE: If the user selected 'Record receipt' on the submission page, then we mark the return log as received, delete
  // the session, and redirect to the confirm-received page
  if (pageData.redirect === 'confirm-received') {
    return h.redirect(`/system/return-logs/setup/confirmed?id=${pageData.returnLogId}`)
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

async function submitVolumes(request, h) {
  const {
    params: { sessionId, yearMonth },
    payload,
    yar
  } = request

  const pageData = await SubmitVolumesService.go(sessionId, payload, yar, yearMonth)

  if (pageData.error) {
    return h.view('return-logs/setup/volumes.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
}

async function units(request, h) {
  const { sessionId } = request.params
  const pageData = await UnitsService.go(sessionId)

  return h.view('return-logs/setup/units.njk', pageData)
}

async function volumes(request, h) {
  const { sessionId, yearMonth } = request.params
  const pageData = await VolumesService.go(sessionId, yearMonth)

  return h.view('return-logs/setup/volumes.njk', pageData)
}

module.exports = {
  cancel,
  check,
  confirmed,
  deleteNote,
  guidance,
  meterDetails,
  meterProvided,
  multipleEntries,
  note,
  periodUsed,
  readings,
  received,
  reported,
  singleVolume,
  startReading,
  submission,
  submitConfirmed,
  submitCancel,
  submitCheck,
  submitMeterDetails,
  submitMeterProvided,
  submitMultipleEntries,
  submitNote,
  submitPeriodUsed,
  submitReadings,
  submitReceived,
  submitReported,
  submitSetup,
  submitSingleVolume,
  submitStartReading,
  submitSubmission,
  submitUnits,
  submitVolumes,
  units,
  volumes
}
