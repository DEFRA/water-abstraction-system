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
 * @param {string} documentId - The UUID of the document
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {object} The data formatted for the view template
 */
function go(communications, documentId, licenceId) {
  return {
    communications: _communications(communications, documentId, licenceId)
  }
}

function _communications(communications, documentId, licenceId) {
  return communications.map((communication) => {
    const sent = formatLongDate(communication.createdAt)

    return {
      id: communication.id,
      link: `/system/notifications/${communication.id}?id=${licenceId}`,
      type: _type(communication, sent),
      sender: communication.event.issuer,
      sent,
      method: sentenceCase(communication.messageType)
    }
  })
}

function _type(communication, sent) {
  return {
    label: _typeLabel(communication),
    sentVia: `sent ${sent} via ${communication.messageType}`
  }
}

function _typeLabel(communication) {
  if (communication.event.metadata.name === 'Water abstraction alert') {
    return (
      `${sentenceCase(communication.event.metadata.options.sendingAlertType)}` +
      ` - ${communication.event.metadata.name}`
    )
  }

  return communication.event.metadata.name
}

module.exports = {
  go
}
