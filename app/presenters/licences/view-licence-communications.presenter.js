'use strict'

/**
 * Formats data for the `/licences/{id}/communications` view licence communications page
 * @module ViewLicenceCommunicationsPresenter
 */

const { formatLongDate, sentenceCase } = require('../base.presenter.js')

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

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
    return {
      id: communication.id,
      link: _link(communication.id, documentId, licenceId),
      type: _type(communication),
      sender: communication.event.issuer,
      sent: _sent(communication),
      method: sentenceCase(communication.messageType)
    }
  })
}

function _link(communicationId, documentId, licenceId) {
  if (FeatureFlagsConfig.enableNotificationsView) {
    return `/system/notifications/${communicationId}?id=${licenceId}`
  }

  return `/licences/${documentId}/communications/${communicationId}`
}

function _sent(communication) {
  return communication.sendAfter
    ? formatLongDate(new Date(communication.sendAfter))
    : formatLongDate(new Date(communication.createdAt))
}

function _type(communication) {
  return {
    label: _typeLabel(communication),
    sentVia: `sent ${_sent(communication)} via ${communication.messageType}`,
    pdf: communication.messageRef.includes('pdf')
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
