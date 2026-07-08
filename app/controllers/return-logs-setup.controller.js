/**
 * Controller for /return-logs/setup endpoints
 * @module ReturnLogsSetupController
 */

import CancelService from '../services/return-logs/setup/cancel.service.js'
import CheckService from '../services/return-logs/setup/check.service.js'
import ConfirmedService from '../services/return-logs/setup/confirmed.service.js'
import DeleteNoteService from '../services/return-logs/setup/delete-note.service.js'
import InitiateSessionService from '../services/return-logs/setup/initiate-session.service.js'
import MeterDetailsService from '../services/return-logs/setup/meter-details.service.js'
import MeterProvidedService from '../services/return-logs/setup/meter-provided.service.js'
import MultipleEntriesService from '../services/return-logs/setup/multiple-entries.service.js'
import NoteService from '../services/return-logs/setup/note.service.js'
import PeriodUsedService from '../services/return-logs/setup/period-used.service.js'
import ReadingsService from '../services/return-logs/setup/readings.service.js'
import ReceivedService from '../services/return-logs/setup/received.service.js'
import ReportedService from '../services/return-logs/setup/reported.service.js'
import SingleVolumeService from '../services/return-logs/setup/single-volume.service.js'
import StartReadingService from '../services/return-logs/setup/start-reading.service.js'
import SubmissionService from '../services/return-logs/setup/submission.service.js'
import SubmitConfirmedService from '../services/return-logs/setup/submit-confirmed.service.js'
import SubmitCancelService from '../services/return-logs/setup/submit-cancel.service.js'
import SubmitCheckService from '../services/return-logs/setup/submit-check.service.js'
import SubmitMeterDetailsService from '../services/return-logs/setup/submit-meter-details.service.js'
import SubmitMeterProvidedService from '../services/return-logs/setup/submit-meter-provided.service.js'
import SubmitMultipleEntriesService from '../services/return-logs/setup/submit-multiple-entries.service.js'
import SubmitNoteService from '../services/return-logs/setup/submit-note.service.js'
import SubmitPeriodUsedService from '../services/return-logs/setup/submit-period-used.service.js'
import SubmitReadingsService from '../services/return-logs/setup/submit-readings.service.js'
import SubmitReceivedService from '../services/return-logs/setup/submit-received.service.js'
import SubmitReportedService from '../services/return-logs/setup/submit-reported.service.js'
import SubmitSingleVolumeService from '../services/return-logs/setup/submit-single-volume.service.js'
import SubmitStartReadingService from '../services/return-logs/setup/submit-start-reading.service.js'
import SubmitSubmissionService from '../services/return-logs/setup/submit-submission.service.js'
import SubmitUnitsService from '../services/return-logs/setup/submit-units.service.js'
import SubmitVolumesService from '../services/return-logs/setup/submit-volumes.service.js'
import UnitsService from '../services/return-logs/setup/units.service.js'
import VolumesService from '../services/return-logs/setup/volumes.service.js'

export async function cancel(request, h) {
  const { sessionId } = request.params
  const pageData = await CancelService(sessionId)

  return h.view('return-logs/setup/cancel.njk', pageData)
}

export async function check(request, h) {
  const { sessionId } = request.params
  const pageData = await CheckService(sessionId, request.yar)

  return h.view('return-logs/setup/check.njk', pageData)
}

export async function confirmed(request, h) {
  const { returnLogId } = request.params
  const pageData = await ConfirmedService(returnLogId)

  return h.view('return-logs/setup/confirmed.njk', pageData)
}

export async function deleteNote(request, h) {
  const { sessionId } = request.params

  await DeleteNoteService(sessionId, request.yar)

  return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
}

export async function guidance(_request, h) {
  return h.view('return-logs/setup/guidance.njk')
}

export async function meterDetails(request, h) {
  const { sessionId } = request.params
  const pageData = await MeterDetailsService(sessionId)

  return h.view('return-logs/setup/meter-details.njk', pageData)
}

export async function meterProvided(request, h) {
  const { sessionId } = request.params
  const pageData = await MeterProvidedService(sessionId)

  return h.view('return-logs/setup/meter-provided.njk', pageData)
}

export async function multipleEntries(request, h) {
  const { sessionId } = request.params
  const pageData = await MultipleEntriesService(sessionId)

  return h.view('return-logs/setup/multiple-entries.njk', pageData)
}

export async function note(request, h) {
  const { sessionId } = request.params

  const pageData = await NoteService(sessionId)

  return h.view('return-logs/setup/note.njk', pageData)
}

export async function periodUsed(request, h) {
  const { sessionId } = request.params
  const pageData = await PeriodUsedService(sessionId)

  return h.view('return-logs/setup/period-used.njk', pageData)
}

export async function readings(request, h) {
  const { sessionId, yearMonth } = request.params
  const pageData = await ReadingsService(sessionId, yearMonth)

  return h.view('return-logs/setup/readings.njk', pageData)
}

export async function received(request, h) {
  const { sessionId } = request.params
  const pageData = await ReceivedService(sessionId)

  return h.view('return-logs/setup/received.njk', pageData)
}

export async function reported(request, h) {
  const { sessionId } = request.params
  const pageData = await ReportedService(sessionId)

  return h.view('return-logs/setup/reported.njk', pageData)
}

export async function singleVolume(request, h) {
  const { sessionId } = request.params
  const pageData = await SingleVolumeService(sessionId)

  return h.view('return-logs/setup/single-volume.njk', pageData)
}

export async function startReading(request, h) {
  const { sessionId } = request.params

  const pageData = await StartReadingService(sessionId)

  return h.view('return-logs/setup/start-reading.njk', pageData)
}

export async function submission(request, h) {
  const { sessionId } = request.params
  const pageData = await SubmissionService(sessionId)

  return h.view('return-logs/setup/submission.njk', pageData)
}

export async function submitConfirmed(request, h) {
  const { returnLogId } = request.params

  const licenceId = await SubmitConfirmedService(returnLogId)

  return h.redirect(`/system/licences/${licenceId}/returns`)
}

export async function submitCancel(request, h) {
  const { sessionId } = request.params
  const { returnLogId } = request.payload

  await SubmitCancelService(sessionId)

  return h.redirect(`/system/return-logs/${returnLogId}/details`)
}

export async function submitCheck(request, h) {
  const { sessionId } = request.params
  const { user } = request.auth.credentials

  const pageData = await SubmitCheckService(sessionId, user)

  if (pageData.error) {
    return h.view('return-logs/setup/check.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/confirmed/${pageData.returnLogId}`)
}

export async function submitMeterDetails(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitMeterDetailsService(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-logs/setup/meter-details.njk', pageData)
  }

  if (pageData.reported === 'abstractionVolumes' && !pageData.checkPageVisited) {
    return h.redirect(`/system/return-logs/setup/${sessionId}/single-volume`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
}

export async function submitMeterProvided(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitMeterProvidedService(sessionId, payload, yar)

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

export async function submitMultipleEntries(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitMultipleEntriesService(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-logs/setup/multiple-entries.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
}

export async function submitNote(request, h) {
  const { sessionId } = request.params
  const { user } = request.auth.credentials

  const pageData = await SubmitNoteService(sessionId, request.payload, user, request.yar)

  if (pageData.error) {
    return h.view('return-logs/setup/note.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
}

export async function submitPeriodUsed(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitPeriodUsedService(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-logs/setup/period-used.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
}

export async function submitReadings(request, h) {
  const {
    params: { sessionId, yearMonth },
    payload,
    yar
  } = request

  const pageData = await SubmitReadingsService(sessionId, payload, yar, yearMonth)

  if (pageData.error) {
    return h.view('return-logs/setup/readings.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
}

export async function submitReceived(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitReceivedService(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-logs/setup/received.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/submission`)
}

export async function submitReported(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitReportedService(sessionId, payload, yar)

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

export async function submitSetup(request, h) {
  const { returnLogId } = request.payload

  const redirectUrl = await InitiateSessionService(returnLogId)

  return h.redirect(redirectUrl)
}

export async function submitSingleVolume(request, h) {
  const {
    params: { sessionId },
    payload
  } = request

  const pageData = await SubmitSingleVolumeService(sessionId, payload)

  if (pageData.error) {
    return h.view('return-logs/setup/single-volume.njk', pageData)
  }

  if (pageData.singleVolume === 'no') {
    return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/period-used`)
}

export async function submitStartReading(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitStartReadingService(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-logs/setup/start-reading.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/units`)
}

export async function submitSubmission(request, h) {
  const { sessionId } = request.params

  const pageData = await SubmitSubmissionService(sessionId, request.payload)

  if (pageData.error) {
    return h.view('return-logs/setup/submission.njk', pageData)
  }

  // NOTE: If the user selected 'Record receipt' on the submission page, then we mark the return log as received, delete
  // the session, and redirect to the confirm-received page
  if (pageData.redirect === 'confirm-received') {
    return h.redirect(`/system/return-logs/setup/confirmed/${pageData.returnLogId}`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/${pageData.redirect}`)
}

export async function submitUnits(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitUnitsService(sessionId, payload, yar)

  if (pageData.error) {
    return h.view('return-logs/setup/units.njk', pageData)
  }

  if (pageData.checkPageVisited) {
    return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/meter-provided`)
}

export async function submitVolumes(request, h) {
  const {
    params: { sessionId, yearMonth },
    payload,
    yar
  } = request

  const pageData = await SubmitVolumesService(sessionId, payload, yar, yearMonth)

  if (pageData.error) {
    return h.view('return-logs/setup/volumes.njk', pageData)
  }

  return h.redirect(`/system/return-logs/setup/${sessionId}/check`)
}

export async function units(request, h) {
  const { sessionId } = request.params
  const pageData = await UnitsService(sessionId)

  return h.view('return-logs/setup/units.njk', pageData)
}

export async function volumes(request, h) {
  const { sessionId, yearMonth } = request.params
  const pageData = await VolumesService(sessionId, yearMonth)

  return h.view('return-logs/setup/volumes.njk', pageData)
}
