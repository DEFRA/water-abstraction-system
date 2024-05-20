'use strict'

/**
 * Formats data for the `/licences/{id}/communications` view licence communications page
 * @module CommunicationsPresenter
 */

const { formatLongDate, sentenceCase } = require('../base.presenter.js')

/**
 * Formats data for the `/licences/{id}/communications` view licence communications page
 *
 * @returns {Object} The data formatted for the view template
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
    alert: _typeAlert(communication),
    label: communication.event.metadata.name,
    sentVia: `sent ${formatLongDate(new Date(communication.event.createdAt))} via ${communication.messageType}`,
    pdf: communication.messageRef.includes('pdf')
  }
}

function _typeAlert (communication) {
  if (communication.event.metadata.name === 'Water abstraction alert') {
    return `${sentenceCase(communication.event.metadata.options.sendingAlertType)}`
  }

  return null
}

module.exports = {
  go
}
