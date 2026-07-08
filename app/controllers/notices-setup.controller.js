/**
 * Controller for /notices/setup endpoints
 * @module NoticesSetupController
 */

import InitiateSessionService from '../services/notices/setup/initiate-session.service.js'
import ProcessAddRecipientService from '../services/notices/setup/process-add-recipient.service.js'
import ProcessDownloadRecipientsService from '../services/notices/setup/process-download-recipients.service.js'
import ProcessPreviewPaperReturnService from '../services/notices/setup/process-preview-paper-return.service.js'
import ProcessRemoveThresholdService from '../services/notices/setup/abstraction-alerts/process-remove-threshold.service.js'
import SubmitAlertEmailAddressService from '../services/notices/setup/abstraction-alerts/submit-alert-email-address.service.js'
import SubmitAlertThresholdsService from '../services/notices/setup/abstraction-alerts/submit-alert-thresholds.service.js'
import SubmitAlertTypeService from '../services/notices/setup/abstraction-alerts/submit-alert-type.service.js'
import SubmitCancelAlertsService from '../services/notices/setup/abstraction-alerts/submit-cancel-alerts.service.js'
import SubmitCancelService from '../services/notices/setup/submit-cancel.service.js'
import SubmitCheckLicenceMatchesService from '../services/notices/setup/abstraction-alerts/submit-check-licence-matches.service.js'
import SubmitCheckNoticeTypeService from '../services/notices/setup/submit-check-notice-type.service.js'
import SubmitCheckService from '../services/notices/setup/submit-check.service.js'
import SubmitContactTypeService from '../services/notices/setup/submit-contact-type.service.js'
import SubmitLicenceService from '../services/notices/setup/submit-licence.service.js'
import SubmitNoticeTypeService from '../services/notices/setup/submit-notice-type.service.js'
import SubmitPaperReturnService from '../services/notices/setup/submit-paper-return.service.js'
import SubmitRecipientNameService from '../services/notices/setup/submit-recipient-name.service.js'
import SubmitRemoveLicencesService from '../services/notices/setup/submit-remove-licences.service.js'
import SubmitReturnsPeriodService from '../services/notices/setup/submit-returns-period.service.js'
import SubmitSelectRecipientsService from '../services/notices/setup/submit-select-recipients.service.js'
import ViewAlertEmailAddressService from '../services/notices/setup/abstraction-alerts/view-alert-email-address.service.js'
import ViewAlertThresholdsService from '../services/notices/setup/abstraction-alerts/view-alert-thresholds.service.js'
import ViewAlertTypeService from '../services/notices/setup/abstraction-alerts/view-alert-type.service.js'
import ViewCancelService from '../services/notices/setup/view-cancel.service.js'
import ViewCancelAlertsService from '../services/notices/setup/abstraction-alerts/view-cancel-alerts.service.js'
import ViewCheckService from '../services/notices/setup/view-check.service.js'
import ViewCheckLicenceMatchesService from '../services/notices/setup/abstraction-alerts/view-check-licence-matches.service.js'
import ViewCheckNoticeTypeService from '../services/notices/setup/view-check-notice-type.service.js'
import ViewConfirmationService from '../services/notices/setup/view-confirmation.service.js'
import ViewContactTypeService from '../services/notices/setup/view-contact-type.service.js'
import ViewLicenceService from '../services/notices/setup/view-licence.service.js'
import ViewNoticeTypeService from '../services/notices/setup/view-notice-type.service.js'
import ViewPaperReturnService from '../services/notices/setup/view-paper-return.service.js'
import ViewPreviewService from '../services/notices/setup/preview/view-preview.service.js'
import ViewPreviewCheckAlertService from '../services/notices/setup/preview/view-preview-check-alert.service.js'
import ViewPreviewCheckPaperReturnService from '../services/notices/setup/preview/view-preview-check-paper-return.service.js'
import ViewRecipientNameService from '../services/notices/setup/view-recipient-name.service.js'
import ViewRemoveLicencesService from '../services/notices/setup/view-remove-licences.service.js'
import ViewReturnsPeriodService from '../services/notices/setup/view-returns-period.service.js'
import ViewSelectRecipientsService from '../services/notices/setup/view-select-recipients.service.js'

export async function processAddRecipient(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  await ProcessAddRecipientService.go(sessionId, yar)

  return h.redirect(`/system/notices/setup/${sessionId}/check`)
}

export async function processDownloadRecipients(request, h) {
  const {
    params: { sessionId }
  } = request

  const { data, type, filename } = await ProcessDownloadRecipientsService.go(sessionId)

  return h
    .response(data)
    .type(type)
    .encoding('binary')
    .header('Content-Type', type)
    .header('Content-Disposition', `attachment; filename="${filename}"`)
}

export async function processPreviewPaperReturn(request, h) {
  const { contactHashId, sessionId, returnLogId } = request.params

  const fileBuffer = await ProcessPreviewPaperReturnService.go(sessionId, contactHashId, returnLogId)

  return h.response(fileBuffer).type('application/pdf').header('Content-Disposition', 'inline; filename="example.pdf"')
}

export async function processRemoveThreshold(request, h) {
  const {
    params: { sessionId, licenceMonitoringStationId },
    yar
  } = request

  await ProcessRemoveThresholdService.go(sessionId, licenceMonitoringStationId, yar)

  return h.redirect(`/system/notices/setup/${sessionId}/abstraction-alerts/check-licence-matches`)
}

export async function setup(request, h) {
  const {
    params: { journey },
    query: { monitoringStationId }
  } = request

  const { sessionId, path } = await InitiateSessionService.go(journey, monitoringStationId)

  return h.redirect(`/system/notices/setup/${sessionId}/${path}`)
}

export async function submitAlertEmailAddress(request, h) {
  const {
    auth,
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitAlertEmailAddressService.go(sessionId, payload, auth)

  if (pageData.error) {
    return h.view(`notices/setup/alert-email-address.njk`, pageData)
  }

  return h.redirect(`/system/notices/setup/${sessionId}/check`)
}

export async function submitAlertThresholds(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitAlertThresholdsService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`notices/setup/alert-thresholds.njk`, pageData)
  }

  return h.redirect(`/system/notices/setup/${sessionId}/abstraction-alerts/check-licence-matches`)
}

export async function submitAlertType(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitAlertTypeService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`notices/setup/alert-type.njk`, pageData)
  }

  return h.redirect(`/system/notices/setup/${sessionId}/abstraction-alerts/alert-thresholds`)
}

export async function submitCancel(request, h) {
  const { sessionId } = request.params

  const redirectURl = await SubmitCancelService.go(sessionId)

  return h.redirect(redirectURl)
}

export async function submitCancelAlerts(request, h) {
  const {
    params: { sessionId }
  } = request

  const { monitoringStationId } = await SubmitCancelAlertsService.go(sessionId)

  return h.redirect(`/system/monitoring-stations/${monitoringStationId}`)
}

export async function submitCheck(request, h) {
  const {
    auth,
    params: { sessionId }
  } = request

  const eventId = await SubmitCheckService.go(sessionId, auth)

  return h.redirect(`/system/notices/setup/${eventId}/confirmation`)
}

export async function submitCheckLicenceMatches(request, h) {
  const {
    params: { sessionId }
  } = request

  await SubmitCheckLicenceMatchesService.go(sessionId)

  return h.redirect(`/system/notices/setup/${sessionId}/abstraction-alerts/alert-email-address`)
}

export async function submitCheckNoticeType(request, h) {
  const {
    params: { sessionId }
  } = request

  await SubmitCheckNoticeTypeService.go(sessionId)

  return h.redirect(`/system/notices/setup/${sessionId}/check`)
}

export async function submitContactType(request, h) {
  const {
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitContactTypeService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view(`notices/setup/contact-type.njk`, pageData)
  }

  if (pageData.contactType === 'post') {
    return h.redirect(`/system/address/${sessionId}/postcode`)
  }

  return h.redirect(`/system/notices/setup/${sessionId}/check`)
}

export async function submitLicence(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitLicenceService.go(sessionId, request.payload, yar)

  if (pageData.error) {
    return h.view(`notices/setup/licence.njk`, pageData)
  }

  return h.redirect(`/system/notices/setup/${sessionId}/${pageData.redirectUrl}`)
}

export async function submitNoticeType(request, h) {
  const {
    auth,
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitNoticeTypeService.go(sessionId, payload, yar, auth)

  if (pageData.error) {
    return h.view(`notices/setup/notice-type.njk`, pageData)
  }

  return h.redirect(`/system/notices/setup/${sessionId}/${pageData.redirectUrl}`)
}

export async function submitRecipientName(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitRecipientNameService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`notices/setup/recipient-name.njk`, pageData)
  }

  return h.redirect(`/system/address/${sessionId}/postcode`)
}

export async function submitRemoveLicences(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitRemoveLicencesService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`notices/setup/remove-licences.njk`, pageData)
  }

  return h.redirect(`/system/notices/setup/${pageData.redirect}`)
}

export async function submitReturnsPeriod(request, h) {
  const {
    payload,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitReturnsPeriodService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view(`notices/setup/returns-period.njk`, pageData)
  }

  return h.redirect(`/system/notices/setup/${pageData.redirect}`)
}

export async function submitPaperReturn(request, h) {
  const {
    payload,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitPaperReturnService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view(`notices/setup/paper-return.njk`, pageData)
  }

  return h.redirect(`/system/notices/setup/${sessionId}/check-notice-type`)
}

export async function submitSelectRecipients(request, h) {
  const {
    payload,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitSelectRecipientsService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view(`notices/setup/select-recipients.njk`, pageData)
  }

  return h.redirect(`/system/notices/setup/${sessionId}/check`)
}

export async function viewAlertEmailAddress(request, h) {
  const {
    auth,
    params: { sessionId }
  } = request

  const pageData = await ViewAlertEmailAddressService.go(sessionId, auth)

  return h.view(`notices/setup/alert-email-address.njk`, pageData)
}

export async function viewAlertThresholds(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewAlertThresholdsService.go(sessionId)

  return h.view(`notices/setup/alert-thresholds.njk`, pageData)
}

export async function viewAlertType(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await ViewAlertTypeService.go(sessionId)

  return h.view(`notices/setup/alert-type.njk`, pageData)
}

export async function viewCancel(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewCancelService.go(sessionId)

  return h.view(`notices/setup/cancel.njk`, pageData)
}

export async function viewCancelAlerts(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewCancelAlertsService.go(sessionId)

  return h.view(`notices/setup/cancel-alerts.njk`, pageData)
}

export async function viewCheck(request, h) {
  const {
    params: { sessionId },
    query: { page },
    yar
  } = request

  const pageData = await ViewCheckService.go(sessionId, yar, page)

  return h.view(`notices/setup/check.njk`, pageData)
}

export async function viewCheckLicenceMatches(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  const pageData = await ViewCheckLicenceMatchesService.go(sessionId, yar)

  return h.view(`notices/setup/check-licence-matches.njk`, pageData)
}

export async function viewCheckNoticeType(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  const pageData = await ViewCheckNoticeTypeService.go(sessionId, yar)

  return h.view(`notices/setup/check-notice-type.njk`, pageData)
}

export async function viewConfirmation(request, h) {
  const { eventId } = request.params

  const pageData = await ViewConfirmationService.go(eventId)

  return h.view(`notices/setup/confirmation.njk`, pageData)
}

export async function viewContactType(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewContactTypeService.go(sessionId)

  return h.view(`notices/setup/contact-type.njk`, pageData)
}

export async function viewLicence(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewLicenceService.go(sessionId)

  return h.view(`notices/setup/licence.njk`, pageData)
}

export async function viewNoticeType(request, h) {
  const {
    auth,
    params: { sessionId }
  } = request

  const pageData = await ViewNoticeTypeService.go(sessionId, auth)

  return h.view(`notices/setup/notice-type.njk`, pageData)
}

export async function viewPaperReturn(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewPaperReturnService.go(sessionId)

  return h.view(`notices/setup/paper-return.njk`, pageData)
}

export async function viewPreview(request, h) {
  const { contactHashId, licenceMonitoringStationId, sessionId } = request.params

  const pageData = await ViewPreviewService.go(sessionId, contactHashId, licenceMonitoringStationId)

  return h.view('notices/setup/preview.njk', pageData)
}

export async function viewPreviewCheckAlert(request, h) {
  const { contactHashId, sessionId } = request.params

  const pageData = await ViewPreviewCheckAlertService.go(contactHashId, sessionId)

  return h.view('notices/setup/preview-check-alert.njk', pageData)
}

export async function viewPreviewCheckPaperReturn(request, h) {
  const { contactHashId, sessionId } = request.params

  const pageData = await ViewPreviewCheckPaperReturnService.go(sessionId, contactHashId)

  return h.view(`notices/setup/preview-check-paper-return.njk`, pageData)
}

export async function viewRecipientName(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewRecipientNameService.go(sessionId)

  return h.view(`notices/setup/recipient-name.njk`, pageData)
}

export async function viewRemoveLicences(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await ViewRemoveLicencesService.go(sessionId)

  return h.view(`notices/setup/remove-licences.njk`, pageData)
}

export async function viewReturnsPeriod(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await ViewReturnsPeriodService.go(sessionId)

  return h.view(`notices/setup/returns-period.njk`, pageData)
}

export async function viewSelectRecipients(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewSelectRecipientsService.go(sessionId)

  return h.view(`notices/setup/select-recipients.njk`, pageData)
}
