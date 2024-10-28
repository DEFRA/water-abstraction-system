'use strict'

/**
 * Formats data for the `/licences/{id}/communications` view licence communications page
 * @module ViewLicenceCommunicationsPresenter
 */

const { formatLongDate, sentenceCase } = require('../base.presenter.js')

/**
 * Formats data for the `/licences/{id}/communications` view licence communications page
 *
 * @param {module:WorkflowModel[]} communications - All in-progress workflow records for the licence
 *
 * @returns {object} The data formatted for the view template
 */
function go (communications) {
  return {
    communications: _communications(communications)
  }
}

function _communications (communications) {
  return communications.map((communication) => {
    return {
      id: communication.id,
      type: _type(communication),
      sender: communication.event.issuer,
      sent: formatLongDate(new Date(communication.event.createdAt)),
      method: sentenceCase(communication.messageType)
    }
  })
}

function _type (communication) {
  return {
    label: _typeLabel(communication),
    sentVia: `sent ${formatLongDate(new Date(communication.event.createdAt))} via ${communication.messageType}`,
    pdf: communication.messageRef.includes('pdf')
  }
}

function _typeLabel (communication) {
  if (communication.event.metadata.name === 'Water abstraction alert') {
    return `${sentenceCase(communication.event.metadata.options.sendingAlertType)}` +
      ` - ${communication.event.metadata.name}`
  }

  return communication.event.metadata.name
}

module.exports = {
  go
}
