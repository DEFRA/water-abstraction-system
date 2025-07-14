'use strict'

/**
 * Formats notification data ready for presenting in the preview notification page
 * @module PreviewPresenter
 */

const NotifyPreviewRequest = require('../../../../requests/notify/notify-preview.request.js')
const { sentenceCase } = require('../../../base.presenter.js')

/**
 * Formats notification data ready for presenting in the preview notification page
 *
 * @param {string} contactHashId - The recipients unique identifier
 * @param {string} noticeType - The type of alert being sent
 * @param {string} licenceMonitoringStationId - The UUID of the licence monitoring station record. This is only
 * @param {object} notification - The data relating to the recipients notification
 * @param {string} sessionId - The UUID for returns notices session record
 *
 * @returns {Promise<object>} The data formatted for the preview template
 */
async function go(contactHashId, noticeType, licenceMonitoringStationId, notification, sessionId) {
  const { messageRef, messageType, personalisation, reference, templateId } = notification

  return {
    address: messageType === 'letter' ? _address(personalisation) : null,
    backLink: _backLink(contactHashId, noticeType, sessionId),
    caption: `Notice ${reference}`,
    contents: await _notifyPreview(personalisation, templateId),
    messageType,
    pageTitle: sentenceCase(messageRef.replace(/_/g, ' ')),
    refreshPageLink: _refreshPageLink(contactHashId, noticeType, licenceMonitoringStationId, sessionId)
  }
}

function _address(personalisation) {
  const addressLines = [
    personalisation['address_line_1'],
    personalisation['address_line_2'],
    personalisation['address_line_3'],
    personalisation['address_line_4'],
    personalisation['address_line_5'],
    personalisation['address_line_6']
  ]

  return addressLines.filter((addressLine) => {
    return addressLine
  })
}

function _backLink(contactHashId, noticeType, sessionId) {
  if (noticeType === 'abstractionAlerts') {
    return `/system/notices/setup/${sessionId}/preview/${contactHashId}/check-alert`
  }

  return `/system/notices/setup/${sessionId}/check`
}

async function _notifyPreview(personalisation, templateId) {
  const { errors, plaintext } = await NotifyPreviewRequest.send(templateId, personalisation)

  if (errors) {
    return 'error'
  } else {
    return plaintext
  }
}

function _refreshPageLink(contactHashId, noticeType, licenceMonitoringStationId, sessionId) {
  const baseRefreshPageLink = `/system/notices/setup/${sessionId}/preview/${contactHashId}`

  if (noticeType === 'abstractionAlerts') {
    return `${baseRefreshPageLink}/alert/${licenceMonitoringStationId}`
  }

  return baseRefreshPageLink
}

module.exports = {
  go
}
