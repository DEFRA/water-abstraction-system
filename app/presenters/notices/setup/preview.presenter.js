'use strict'

/**
 * Formats notification data ready for presenting in the preview notification page
 * @module PreviewPresenter
 */

const NotifyPreviewRequest = require('../../../requests/notify/notify-preview.request.js')
const { titleCase } = require('../../base.presenter.js')

/**
 * Formats notification data ready for presenting in the preview notification page
 *
 * @param {object} notification - The data relating to the recipients notification
 * @param {string} sessionId - The UUID for returns notices session record
 *
 * @returns {object} The data formatted for the preview template
 */
async function go(notification, sessionId) {
  const { licences, messageRef, messageType, personalisation, templateId } = notification

  return {
    address: messageType === 'letter' ? _address(personalisation) : null,
    backLink: `/system/notices/setup/${sessionId}/check`,
    caption: _caption(licences),
    contents: await _notifyPreview(personalisation, templateId),
    messageType,
    pageTitle: titleCase(messageRef.replace(/_/g, ' '))
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

function _caption(licences) {
  const licencesArray = JSON.parse(licences)
  const maxLicencesToDisplay = 4

  if (licencesArray.length === 1) {
    return `Licence ${licencesArray[0]}`
  }

  if (licencesArray.length > maxLicencesToDisplay) {
    return `Licences ${licencesArray.slice(0, maxLicencesToDisplay).join(', ')}...`
  }

  return `Licences ${licencesArray.join(', ')}`
}

async function _notifyPreview(personalisation, templateId) {
  const { plaintext } = await NotifyPreviewRequest.send(templateId, personalisation)

  return plaintext
}

module.exports = {
  go
}
