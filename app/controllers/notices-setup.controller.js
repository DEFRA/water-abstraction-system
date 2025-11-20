'use strict'

/**
 * Controller for /notices/setup endpoints
 * @module NoticesSetupController
 */

const InitiateSessionService = require('../services/notices/setup/initiate-session.service.js')
const ProcessAddRecipientService = require('../services/notices/setup/process-add-recipient.service.js')
const ProcessDownloadRecipientsService = require('../services/notices/setup/process-download-recipients.service.js')
const ProcessPreviewPaperReturnService = require('../services/notices/setup/process-preview-paper-return.service.js')
const ProcessRemoveThresholdService = require('../services/notices/setup/process-remove-threshold.service.js')
const SubmitAlertEmailAddressService = require('../services/notices/setup/submit-alert-email-address.service.js')
const SubmitAlertThresholdsService = require('../services/notices/setup/submit-alert-thresholds.service.js')
const SubmitAlertTypeService = require('../services/notices/setup/submit-alert-type.service.js')
const SubmitCancelAlertsService = require('../services/notices/setup/submit-cancel-alerts.service.js')
const SubmitCancelService = require('../services/notices/setup/submit-cancel.service.js')
const SubmitCheckLicenceMatchesService = require('../services/notices/setup/submit-check-licence-matches.service.js')
const SubmitCheckNoticeTypeService = require('../services/notices/setup/submit-check-notice-type.service.js')
const SubmitCheckService = require('../services/notices/setup/submit-check.service.js')
const SubmitContactTypeService = require('../services/notices/setup/submit-contact-type.service.js')
const SubmitLicenceService = require('../services/notices/setup/submit-licence.service.js')
const SubmitNoticeTypeService = require('../services/notices/setup/submit-notice-type.service.js')
const SubmitPaperReturnService = require('../services/notices/setup/submit-paper-return.service.js')
const SubmitRecipientNameService = require('../services/notices/setup/submit-recipient-name.service.js')
const SubmitRemoveLicencesService = require('../services/notices/setup/submit-remove-licences.service.js')
const SubmitReturnsPeriodService = require('../services/notices/setup/submit-returns-period.service.js')
const SubmitSelectRecipientsService = require('../services/notices/setup/submit-select-recipients.service.js')
const ViewAlertEmailAddressService = require('../services/notices/setup/view-alert-email-address.service.js')
const ViewAlertThresholdsService = require('../services/notices/setup/view-alert-thresholds.service.js')
const ViewAlertTypeService = require('../services/notices/setup/view-alert-type.service.js')
const ViewCancelService = require('../services/notices/setup/view-cancel.service.js')
const ViewCancelAlertsService = require('../services/notices/setup/view-cancel-alerts.service.js')
const ViewCheckService = require('../services/notices/setup/view-check.service.js')
const ViewCheckLicenceMatchesService = require('../services/notices/setup/view-check-licence-matches.service.js')
const ViewCheckNoticeTypeService = require('../services/notices/setup/view-check-notice-type.service.js')
const ViewConfirmationService = require('../services/notices/setup/view-confirmation.service.js')
const ViewContactTypeService = require('../services/notices/setup/view-contact-type.service.js')
const ViewLicenceService = require('../services/notices/setup/view-licence.service.js')
const ViewNoticeTypeService = require('../services/notices/setup/view-notice-type.service.js')
const ViewPaperReturnService = require('../services/notices/setup/view-paper-return.service.js')
const ViewPreviewService = require('../services/notices/setup/view-preview.service.js')
const ViewPreviewCheckAlertService = require('../services/notices/setup/view-preview-check-alert.service.js')
const ViewPreviewCheckPaperReturnService = require('../services/notices/setup/view-preview-check-paper-return.service.js')
const ViewRecipientNameService = require('../services/notices/setup/view-recipient-name.service.js')
const ViewRemoveLicencesService = require('../services/notices/setup/view-remove-licences.service.js')
const ViewReturnsPeriodService = require('../services/notices/setup/view-returns-period.service.js')
const ViewSelectRecipientsService = require('../services/notices/setup/view-select-recipients.service.js')

async function processAddRecipient(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  await ProcessAddRecipientService.go(sessionId, yar)

  return h.redirect(`/system/notices/setup/${sessionId}/check`)
}

async function processDownloadRecipients(request, h) {
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

async function processPreviewPaperReturn(request, h) {
  const { contactHashId, sessionId, returnId } = request.params

  const fileBuffer = await ProcessPreviewPaperReturnService.go(sessionId, contactHashId, returnId)

  return h.response(fileBuffer).type('application/pdf').header('Content-Disposition', 'inline; filename="example.pdf"')
}

async function processRemoveThreshold(request, h) {
  const {
    params: { sessionId, licenceMonitoringStationId },
    yar
  } = request

  await ProcessRemoveThresholdService.go(sessionId, licenceMonitoringStationId, yar)

  return h.redirect(`/system/notices/setup/${sessionId}/abstraction-alerts/check-licence-matches`)
}

async function setup(request, h) {
  const {
    params: { journey },
    query: { monitoringStationId, noticeType }
  } = request

  const { sessionId, path } = await InitiateSessionService.go(journey, noticeType, monitoringStationId)

  return h.redirect(`/system/notices/setup/${sessionId}/${path}`)
}

async function submitAlertEmailAddress(request, h) {
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

async function submitAlertThresholds(request, h) {
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

async function submitAlertType(request, h) {
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

async function submitCancel(request, h) {
  const { sessionId } = request.params

  const redirectURl = await SubmitCancelService.go(sessionId)

  return h.redirect(redirectURl)
}

async function submitCancelAlerts(request, h) {
  const {
    params: { sessionId }
  } = request

  const { monitoringStationId } = await SubmitCancelAlertsService.go(sessionId)

  return h.redirect(`/system/monitoring-stations/${monitoringStationId}`)
}

async function submitCheck(request, h) {
  const {
    auth,
    params: { sessionId }
  } = request

  const eventId = await SubmitCheckService.go(sessionId, auth)

  return h.redirect(`/system/notices/setup/${eventId}/confirmation`)
}

async function submitCheckLicenceMatches(request, h) {
  const {
    params: { sessionId }
  } = request

  await SubmitCheckLicenceMatchesService.go(sessionId)

  return h.redirect(`/system/notices/setup/${sessionId}/abstraction-alerts/alert-email-address`)
}

async function submitCheckNoticeType(request, h) {
  const {
    params: { sessionId }
  } = request

  await SubmitCheckNoticeTypeService.go(sessionId)

  return h.redirect(`/system/notices/setup/${sessionId}/check`)
}

async function submitContactType(request, h) {
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

async function submitLicence(request, h) {
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

async function submitNoticeType(request, h) {
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

async function submitRecipientName(request, h) {
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

async function submitRemoveLicences(request, h) {
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

async function submitReturnsPeriod(request, h) {
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

async function submitPaperReturn(request, h) {
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

async function submitSelectRecipients(request, h) {
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

async function viewAlertEmailAddress(request, h) {
  const {
    auth,
    params: { sessionId }
  } = request

  const pageData = await ViewAlertEmailAddressService.go(sessionId, auth)

  return h.view(`notices/setup/alert-email-address.njk`, pageData)
}

async function viewAlertThresholds(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewAlertThresholdsService.go(sessionId)

  return h.view(`notices/setup/alert-thresholds.njk`, pageData)
}

async function viewAlertType(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await ViewAlertTypeService.go(sessionId)

  return h.view(`notices/setup/alert-type.njk`, pageData)
}

async function viewCancel(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewCancelService.go(sessionId)

  return h.view(`notices/setup/cancel.njk`, pageData)
}

async function viewCancelAlerts(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewCancelAlertsService.go(sessionId)

  return h.view(`notices/setup/cancel-alerts.njk`, pageData)
}

async function viewCheck(request, h) {
  const {
    params: { sessionId },
    query: { page },
    yar
  } = request

  const pageData = await ViewCheckService.go(sessionId, yar, page)

  return h.view(`notices/setup/check.njk`, pageData)
}

async function viewCheckLicenceMatches(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  const pageData = await ViewCheckLicenceMatchesService.go(sessionId, yar)

  return h.view(`notices/setup/check-licence-matches.njk`, pageData)
}

async function viewCheckNoticeType(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  const pageData = await ViewCheckNoticeTypeService.go(sessionId, yar)

  return h.view(`notices/setup/check-notice-type.njk`, pageData)
}

async function viewConfirmation(request, h) {
  const { eventId } = request.params

  const pageData = await ViewConfirmationService.go(eventId)

  return h.view(`notices/setup/confirmation.njk`, pageData)
}

async function viewContactType(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewContactTypeService.go(sessionId)

  return h.view(`notices/setup/contact-type.njk`, pageData)
}

async function viewLicence(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewLicenceService.go(sessionId)

  return h.view(`notices/setup/licence.njk`, pageData)
}

async function viewNoticeType(request, h) {
  const {
    auth,
    params: { sessionId }
  } = request

  const pageData = await ViewNoticeTypeService.go(sessionId, auth)

  return h.view(`notices/setup/notice-type.njk`, pageData)
}

async function viewPaperReturn(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewPaperReturnService.go(sessionId)

  return h.view(`notices/setup/paper-return.njk`, pageData)
}

async function viewPreview(request, h) {
  const { contactHashId, licenceMonitoringStationId, sessionId } = request.params

  const pageData = await ViewPreviewService.go(sessionId, contactHashId, licenceMonitoringStationId)

  return h.view('notices/setup/preview.njk', pageData)
}

async function viewPreviewCheckAlert(request, h) {
  const { contactHashId, sessionId } = request.params

  const pageData = await ViewPreviewCheckAlertService.go(contactHashId, sessionId)

  return h.view('notices/setup/preview-check-alert.njk', pageData)
}

async function viewPreviewCheckPaperReturn(request, h) {
  const { contactHashId, sessionId } = request.params

  const pageData = await ViewPreviewCheckPaperReturnService.go(sessionId, contactHashId)

  return h.view(`notices/setup/preview-check-paper-return.njk`, pageData)
}

async function viewRecipientName(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewRecipientNameService.go(sessionId)

  return h.view(`notices/setup/recipient-name.njk`, pageData)
}

async function viewRemoveLicences(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await ViewRemoveLicencesService.go(sessionId)

  return h.view(`notices/setup/remove-licences.njk`, pageData)
}

async function viewReturnsPeriod(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await ViewReturnsPeriodService.go(sessionId)

  return h.view(`notices/setup/returns-period.njk`, pageData)
}

async function viewSelectRecipients(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewSelectRecipientsService.go(sessionId)

  return h.view(`notices/setup/select-recipients.njk`, pageData)
}

module.exports = {
  processAddRecipient,
  processDownloadRecipients,
  processPreviewPaperReturn,
  processRemoveThreshold,
  setup,
  submitAlertEmailAddress,
  submitAlertThresholds,
  submitAlertType,
  submitCancel,
  submitCancelAlerts,
  submitCheck,
  submitCheckLicenceMatches,
  submitCheckNoticeType,
  submitContactType,
  submitLicence,
  submitNoticeType,
  submitPaperReturn,
  submitRecipientName,
  submitRemoveLicences,
  submitReturnsPeriod,
  submitSelectRecipients,
  viewAlertEmailAddress,
  viewAlertThresholds,
  viewAlertType,
  viewCancel,
  viewCancelAlerts,
  viewCheck,
  viewCheckLicenceMatches,
  viewCheckNoticeType,
  viewConfirmation,
  viewContactType,
  viewLicence,
  viewNoticeType,
  viewPaperReturn,
  viewPreview,
  viewPreviewCheckAlert,
  viewPreviewCheckPaperReturn,
  viewRecipientName,
  viewRemoveLicences,
  viewReturnsPeriod,
  viewSelectRecipients
}
