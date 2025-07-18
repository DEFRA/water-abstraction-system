'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/preview/{contactHashId}/check-alert` page
 * @module CheckAlertPresenter
 */

const DetermineRelevantLicenceMonitoringStationsService = require('../../../../services/notices/setup/abstraction-alerts/determine-relevant-licence-monitoring-stations.service.js')
const { determineRestrictionHeading, formatRestrictions } = require('../../../monitoring-stations/base.presenter.js')

/**
 * Formats data for the `/notices/setup/{sessionId}/preview/{contactHashId}/check-alert` page
 *
 * @param {string} contactHashId - The recipients unique identifier
 * @param {Array} recipientLicenceRefs - The references of the licences associated with the recipient
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(contactHashId, recipientLicenceRefs, session) {
  const { id: sessionId, licenceMonitoringStations, referenceCode } = session

  return {
    backLink: `/system/notices/setup/${sessionId}/check`,
    caption: `Notice ${referenceCode}`,
    pageTitle: 'Check the recipient previews',
    restrictionHeading: determineRestrictionHeading(licenceMonitoringStations),
    restrictions: _restrictions(contactHashId, recipientLicenceRefs, session)
  }
}

function _action(contactHashId, sessionId, licenceMonitoringStation) {
  return {
    link: `/system/notices/setup/${sessionId}/preview/${contactHashId}/alert/${licenceMonitoringStation.id}`,
    text: 'Preview'
  }
}

function _restrictions(contactHashId, recipientLicenceRefs, session) {
  const recipientLicenceMonitoringStations = _recipientLicenceMonitoringStations(recipientLicenceRefs, session)

  const preparedLicenceMonitoringStations = _preparedLicenceMonitoringStations(
    contactHashId,
    recipientLicenceMonitoringStations,
    session.id
  )

  return formatRestrictions(preparedLicenceMonitoringStations)
}

function _preparedLicenceMonitoringStations(contactHashId, recipientLicenceMonitoringStations, sessionId) {
  return recipientLicenceMonitoringStations.map((licenceMonitoringStation) => {
    return {
      ...licenceMonitoringStation,
      action: _action(contactHashId, sessionId, licenceMonitoringStation),
      statusUpdatedAt: licenceMonitoringStation.statusUpdatedAt
        ? new Date(licenceMonitoringStation.statusUpdatedAt)
        : null
    }
  })
}

function _recipientLicenceMonitoringStations(recipientLicenceRefs, session) {
  const { alertThresholds, alertType, licenceMonitoringStations, removedThresholds } = session

  const relevantLicenceMonitoringStations = DetermineRelevantLicenceMonitoringStationsService.go(
    licenceMonitoringStations,
    alertThresholds,
    removedThresholds,
    alertType
  )

  return relevantLicenceMonitoringStations.filter((relevantLicenceMonitoringStation) => {
    return recipientLicenceRefs.includes(relevantLicenceMonitoringStation.licence.licenceRef)
  })
}

module.exports = {
  go
}
