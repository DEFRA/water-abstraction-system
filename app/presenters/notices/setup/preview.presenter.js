'use strict'

/**
 * Formats notification data ready for presenting in the preview notification page
 * @module PreviewPresenter
 */

const NotifyPreviewRequest = require('../../../requests/notify/notify-preview.request.js')
const { sentenceCase } = require('../../base.presenter.js')

/**
 * Formats notification data ready for presenting in the preview notification page
 *
 * @param {string} contactHashId - The recipients unique identifier
 * @param {object} notification - The data relating to the recipients notification
 * @param {string} sessionId - The UUID for returns notices session record
 *
 * @returns {Promise<object>} The data formatted for the preview template
 */
async function go(contactHashId, notification, sessionId) {
  const { messageRef, messageType, personalisation, reference, templateId } = notification

  return {
    address: messageType === 'letter' ? _address(personalisation) : null,
    backLink: `/system/notices/setup/${sessionId}/check`,
    caption: `Notice ${reference}`,
    contents: await _notifyPreview(personalisation, templateId),
    messageType,
    pageTitle: sentenceCase(messageRef.replace(/_/g, ' ')),
    refreshPageLink: `/system/notices/setup/${sessionId}/preview/${contactHashId}`
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

async function _notifyPreview(personalisation, templateId) {
  const { errors, plaintext } = await NotifyPreviewRequest.send(templateId, personalisation)

  if (errors) {
    return 'error'
  } else {
    return plaintext
  }
}

module.exports = {
  go
}
