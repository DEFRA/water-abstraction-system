'use strict'

/**
 * Formats notification data ready for presenting in the preview notification page
 * @module PreviewPresenter
 */

const GeneratePreviewRequest = require('../../../../requests/notify/generate-preview.request.js')

const { sentenceCase } = require('../../../base.presenter.js')

/**
 * Formats notification data ready for presenting in the preview notification page
 *
 * @param {string} contactHashId - The recipients unique identifier
 * @param {string} noticeType - The type of notice being sent
 * @param {object} notification - The data relating to the recipients notification
 * @param {string} sessionId - The UUID for returns notices session record
 * @param {string} [licenceMonitoringStationId=null] - The UUID of the licence monitoring station record (This is only
 * populated for abstraction alerts)
 *
 * @returns {Promise<object>} The data formatted for the preview page
 */
async function go(contactHashId, noticeType, notification, sessionId, licenceMonitoringStationId) {
  const { messageRef, messageType, personalisation, recipient, reference, templateId } = notification

  return {
    address: messageType === 'letter' ? _address(personalisation) : recipient,
    backLink: { href: _backLink(contactHashId, noticeType, sessionId), text: 'Back' },
    contents: await _notifyPreview(personalisation, templateId),
    messageType,
    pageTitle: sentenceCase(messageRef.replace(/_/g, ' ')),
    pageTitleCaption: `Notice ${reference}`,
    refreshPageLink: _refreshPageLink(contactHashId, noticeType, licenceMonitoringStationId, sessionId)
  }
}

function _address(personalisation) {
  return [
    personalisation['address_line_1'],
    personalisation['address_line_2'],
    personalisation['address_line_3'],
    personalisation['address_line_4'],
    personalisation['address_line_5'],
    personalisation['address_line_6'],
    personalisation['address_line_7']
  ].filter(Boolean)
}

function _backLink(contactHashId, noticeType, sessionId) {
  if (noticeType === 'abstractionAlerts') {
    return `/system/notices/setup/${sessionId}/preview/${contactHashId}/check-alert`
  }

  return `/system/notices/setup/${sessionId}/check`
}

async function _notifyPreview(personalisation, templateId) {
  const previewResult = await GeneratePreviewRequest.send(templateId, personalisation)

  if (previewResult.succeeded) {
    return previewResult.response.body.body
  }

  return 'error'
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
