'use strict'

/**
 * Formats data for the `/notices/setup/{eventId}/confirmation` page
 * @module ConfirmationPresenter
 */

const featureFlagsConfig = require('../../../../config/feature-flags.config.js')

/**
 * Formats data for the `/notices/setup/{eventId}/confirmation` page
 *
 * @param {module:EventModel} event
 *
 * @returns {object} - The data formatted for the view template
 */
function go(event) {
  const { referenceCode, subtype, id: eventId, metadata } = event

  return {
    forwardLink: _forwardLink(eventId),
    monitoringStationLink: _monitoringStationLink(metadata),
    pageTitle: _pageTitle(subtype),
    referenceCode
  }
}

function _forwardLink(eventId) {
  if (featureFlagsConfig.enableSystemNoticeView) {
    return `/system/notices/${eventId}`
  }

  return `/notifications/report/${eventId}`
}

function _monitoringStationLink(metadata) {
  return metadata.options?.monitoringStationId
    ? `/system/monitoring-stations/${metadata.options?.monitoringStationId}`
    : null
}

/**
 * An Event 'subType' is a legacy code concept we have needed to adapt to conform to existing patterns.
 *
 * We convert our 'journey' keys into 'supTypes' when we create an event. As we have no access to the session for the
 * confirmation page we need to remap these 'supTypes' into 'journey' keys to display to the user to keep conformity.
 *
 * @private
 */
function _pageTitle(subType) {
  if (subType === 'waterAbstractionAlerts') {
    return 'Water abstraction alerts sent'
  }

  if (subType === 'paperReturnForms') {
    return 'Paper return forms sent'
  }

  const subTypes = {
    returnInvitation: 'invitations',
    returnReminder: 'reminders'
  }

  return `Returns ${subTypes[subType]} sent`
}

module.exports = {
  go
}
