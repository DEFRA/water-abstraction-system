'use strict'

/**
 * Controller for /notices/setup endpoints
 * @module NoticesSetupController
 */

const AddRecipientService = require('../services/notices/setup/add-recipient.service.js')
const AlertEmailAddressService = require('../services/notices/setup/abstraction-alerts/alert-email-address.service.js')
const AlertThresholdsService = require('../services/notices/setup/abstraction-alerts/alert-thresholds.service.js')
const AlertTypeService = require('../services/notices/setup/abstraction-alerts/alert-type.service.js')
const CancelAlertsService = require('../services/notices/setup/abstraction-alerts/cancel-alerts.service.js')
const CancelService = require('../services/notices/setup/cancel.service.js')
const CheckAlertService = require('../services/notices/setup/preview/check-alert.service.js')
const CheckLicenceMatchesService = require('../services/notices/setup/abstraction-alerts/check-licence-matches.service.js')
const CheckNoticeTypeService = require('../services/notices/setup/check-notice-type.service.js')
const CheckReturnFormsService = require('../services/notices/setup/preview/check-return-forms.service.js')
const CheckService = require('../services/notices/setup/check.service.js')
const ConfirmationService = require('../services/notices/setup/confirmation.service.js')
const ContactTypeService = require('../services/notices/setup/contact-type.service.js')
const DownloadRecipientsService = require('../services/notices/setup/download-recipients.service.js')
const InitiateSessionService = require('../services/notices/setup/initiate-session.service.js')
const LicenceService = require('../services/notices/setup/licence.service.js')
const NoticeTypeService = require('../services/notices/setup/notice-type.service.js')
const PreviewReturnFormsService = require('../services/notices/setup/preview-return-forms.service.js')
const PreviewService = require('../services/notices/setup/preview/preview.service.js')
const RemoveLicencesService = require('../services/notices/setup/remove-licences.service.js')
const RemoveThresholdService = require('../services/notices/setup/abstraction-alerts/remove-threshold.service.js')
const ReturnFormsService = require('../services/notices/setup/return-forms.service.js')
const SelectRecipientsService = require('../services/notices/setup/select-recipients.service.js')
const ReturnsPeriodService = require('../services/notices/setup/returns-period/returns-period.service.js')
const SubmitAlertEmailAddressService = require('../services/notices/setup/abstraction-alerts/submit-alert-email-address.service.js')
const SubmitAlertThresholdsService = require('../services/notices/setup/abstraction-alerts/submit-alert-thresholds.service.js')
const SubmitAlertTypeService = require('../services/notices/setup/abstraction-alerts/submit-alert-type.service.js')
const SubmitCancelAlertsService = require('../services/notices/setup/abstraction-alerts/submit-cancel-alerts.service.js')
const SubmitCancelService = require('../services/notices/setup/submit-cancel.service.js')
const SubmitCheckLicenceMatchesService = require('../services/notices/setup/abstraction-alerts/submit-check-licence-matches.service.js')
const SubmitCheckService = require('../services/notices/setup/submit-check.service.js')
const SubmitContactTypeService = require('../services/notices/setup/submit-contact-type.service.js')
const SubmitLicenceService = require('../services/notices/setup/submit-licence.service.js')
const SubmitNoticeTypeService = require('../services/notices/setup/submit-notice-type.service.js')
const SubmitRemoveLicencesService = require('../services/notices/setup/submit-remove-licences.service.js')
const SubmitReturnFormsService = require('../services/notices/setup/submit-return-forms.service.js')
const SubmitReturnsPeriodService = require('../services/notices/setup/returns-period/submit-returns-period.service.js')
const SubmitSelectRecipientsService = require('../services/notices/setup/submit-select-recipients.service.js')

async function addRecipient(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  await AddRecipientService.go(sessionId, yar)

  return h.redirect(`/system/notices/setup/${sessionId}/check`)
}

async function checkAlert(request, h) {
  const { contactHashId, sessionId } = request.params

  const pageData = await CheckAlertService.go(contactHashId, sessionId)

  return h.view('notices/setup/preview/check-alert.njk', pageData)
}

async function viewCheckReturnForms(request, h) {
  const { contactHashId, sessionId } = request.params

  const pageData = await CheckReturnFormsService.go(sessionId, contactHashId)

  return h.view(`notices/setup/preview/check-return-forms.njk`, pageData)
}

async function downloadRecipients(request, h) {
  const {
    params: { sessionId }
  } = request

  const { data, type, filename } = await DownloadRecipientsService.go(sessionId)

  return h
    .response(data)
    .type(type)
    .encoding('binary')
    .header('Content-Type', type)
    .header('Content-Disposition', `attachment; filename="${filename}"`)
}

async function preview(request, h) {
  const { contactHashId, licenceMonitoringStationId, sessionId } = request.params

  const pageData = await PreviewService.go(contactHashId, sessionId, licenceMonitoringStationId)

  return h.view('notices/setup/preview/preview.njk', pageData)
}

async function viewAlertEmailAddress(request, h) {
  const {
    auth,
    params: { sessionId }
  } = request

  const pageData = await AlertEmailAddressService.go(sessionId, auth)

  return h.view(`notices/setup/abstraction-alerts/alert-email-address.njk`, pageData)
}

async function viewAlertThresholds(request, h) {
  const { sessionId } = request.params

  const pageData = await AlertThresholdsService.go(sessionId)

  return h.view(`notices/setup/abstraction-alerts/alert-thresholds.njk`, pageData)
}

async function viewAlertType(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await AlertTypeService.go(sessionId)

  return h.view(`notices/setup/abstraction-alerts/alert-type.njk`, pageData)
}

async function viewCancel(request, h) {
  const { sessionId } = request.params

  const pageData = await CancelService.go(sessionId)

  return h.view(`notices/setup/cancel.njk`, pageData)
}

async function viewCancelAlerts(request, h) {
  const { sessionId } = request.params

  const pageData = await CancelAlertsService.go(sessionId)

  return h.view(`notices/setup/abstraction-alerts/cancel-alerts.njk`, pageData)
}

async function viewCheckLicenceMatches(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  const pageData = await CheckLicenceMatchesService.go(sessionId, yar)

  return h.view(`notices/setup/abstraction-alerts/check-licence-matches.njk`, pageData)
}

async function viewCheckNoticeType(request, h) {
  const {
    params: { sessionId },
    yar
  } = request

  const pageData = await CheckNoticeTypeService.go(sessionId, yar)

  return h.view(`notices/setup/check-notice-type.njk`, pageData)
}

async function viewConfirmation(request, h) {
  const { eventId } = request.params

  const pageData = await ConfirmationService.go(eventId)

  return h.view(`notices/setup/confirmation.njk`, pageData)
}

async function viewContactType(request, h) {
  const { sessionId } = request.params

  const pageData = await ContactTypeService.go(sessionId)

  return h.view(`notices/setup/contact-type.njk`, pageData)
}

async function viewLicence(request, h) {
  const { sessionId } = request.params

  const pageData = await LicenceService.go(sessionId)

  return h.view(`notices/setup/licence.njk`, pageData)
}

async function viewRemoveLicences(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await RemoveLicencesService.go(sessionId)

  return h.view(`notices/setup/remove-licences.njk`, pageData)
}

async function viewReturnsPeriod(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await ReturnsPeriodService.go(sessionId)

  return h.view(`notices/setup/view-returns-period.njk`, pageData)
}

async function viewCheck(request, h) {
  const {
    params: { sessionId },
    query: { page },
    yar
  } = request

  const pageData = await CheckService.go(sessionId, yar, page)

  return h.view(`notices/setup/check.njk`, pageData)
}

async function viewNoticeType(request, h) {
  const { sessionId } = request.params

  const pageData = await NoticeTypeService.go(sessionId)

  return h.view(`notices/setup/notice-type.njk`, pageData)
}

async function viewPreviewReturnForms(request, h) {
  const { contactHashId, sessionId, returnId } = request.params

  const fileBuffer = await PreviewReturnFormsService.go(sessionId, contactHashId, returnId)

  return h.response(fileBuffer).type('application/pdf').header('Content-Disposition', 'inline; filename="example.pdf"')
}

async function viewRemoveThreshold(request, h) {
  const {
    params: { sessionId, licenceMonitoringStationId },
    yar
  } = request

  await RemoveThresholdService.go(sessionId, licenceMonitoringStationId, yar)

  return h.redirect(`/system/notices/setup/${sessionId}/abstraction-alerts/check-licence-matches`)
}

async function viewReturnForms(request, h) {
  const { sessionId } = request.params

  const pageData = await ReturnFormsService.go(sessionId)

  return h.view(`notices/setup/return-forms.njk`, pageData)
}

async function setup(request, h) {
  const {
    params: { journey },
    query: { noticeType, monitoringStationId }
  } = request

  const { sessionId, path } = await InitiateSessionService.go(journey, noticeType, monitoringStationId)

  return h.redirect(`/system/notices/setup/${sessionId}/${path}`)
}

async function viewSelectRecipients(request, h) {
  const { sessionId } = request.params

  const pageData = await SelectRecipientsService.go(sessionId)

  return h.view(`notices/setup/select-recipients.njk`, pageData)
}

async function submitAlertEmailAddress(request, h) {
  const {
    auth,
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitAlertEmailAddressService.go(sessionId, payload, auth)

  if (pageData.error) {
    return h.view(`notices/setup/abstraction-alerts/alert-email-address.njk`, pageData)
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
    return h.view(`notices/setup/abstraction-alerts/alert-thresholds.njk`, pageData)
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
    return h.view(`notices/setup/abstraction-alerts/alert-type.njk`, pageData)
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

  if (pageData.type === 'post') {
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
    params: { sessionId },
    payload,
    yar
  } = request

  const pageData = await SubmitNoticeTypeService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view(`notices/setup/notice-type.njk`, pageData)
  }

  return h.redirect(`/system/notices/setup/${sessionId}/${pageData.redirectUrl}`)
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
    params: { sessionId }
  } = request

  const pageData = await SubmitReturnsPeriodService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`notices/setup/view-returns-period.njk`, pageData)
  }

  return h.redirect(`/system/notices/setup/${pageData.redirect}`)
}

async function submitReturnForms(request, h) {
  const {
    payload,
    params: { sessionId },
    yar
  } = request

  const pageData = await SubmitReturnFormsService.go(sessionId, payload, yar)

  if (pageData.error) {
    return h.view(`notices/setup/return-forms.njk`, pageData)
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

module.exports = {
  addRecipient,
  checkAlert,
  downloadRecipients,
  preview,
  viewAlertEmailAddress,
  viewAlertThresholds,
  viewAlertType,
  viewCancel,
  viewCancelAlerts,
  viewCheck,
  viewCheckLicenceMatches,
  viewCheckNoticeType,
  viewCheckReturnForms,
  viewConfirmation,
  viewContactType,
  viewLicence,
  viewNoticeType,
  viewPreviewReturnForms,
  viewRemoveLicences,
  viewRemoveThreshold,
  viewReturnForms,
  viewReturnsPeriod,
  viewSelectRecipients,
  setup,
  submitAlertEmailAddress,
  submitAlertThresholds,
  submitAlertType,
  submitCancel,
  submitCancelAlerts,
  submitCheck,
  submitCheckLicenceMatches,
  submitContactType,
  submitLicence,
  submitNoticeType,
  submitRemoveLicences,
  submitReturnForms,
  submitReturnsPeriod,
  submitSelectRecipients
}
