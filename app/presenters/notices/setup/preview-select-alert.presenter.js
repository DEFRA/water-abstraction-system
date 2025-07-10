'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/preview/{contactHashId}/select-alert` page
 * @module PreviewSelectAlertPresenter
 */

const DetermineRelevantLicenceMonitoringStationsService = require('../../../services/notices/setup/abstraction-alerts/determine-relevant-licence-monitoring-stations.service.js')
const { determineRestrictionHeading, formatRestrictions } = require('../../monitoring-stations/base.presenter.js')

/**
 * Formats data for the `/notices/setup/{sessionId}/preview/{contactHashId}/select-alert` page
 *
 * @param {string} contactHashId - The recipients unique identifier
 * @param {Array} recipientLicenceRefs - The references of the licences associated with the recipient
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(contactHashId, recipientLicenceRefs, session) {
  const {
    alertThresholds,
    alertType,
    id: sessionId,
    licenceMonitoringStations,
    referenceCode,
    removedThresholds
  } = session

  return {
    backLink: `/system/notices/setup/${sessionId}/check`,
    caption: referenceCode,
    pageTitle: 'Check the recipient previews',
    restrictions: _restrictions(
      alertThresholds,
      alertType,
      contactHashId,
      licenceMonitoringStations,
      recipientLicenceRefs,
      removedThresholds,
      sessionId
    ),
    restrictionHeading: determineRestrictionHeading(licenceMonitoringStations)
  }
}

function _action(contactHashId, sessionId, licenceMonitoringStation) {
  return {
    link: `/system/notices/setup/${sessionId}/preview/${contactHashId}/alert/${licenceMonitoringStation.id}`,
    text: 'Preview'
  }
}

function _restrictions(
  alertThresholds,
  alertType,
  contactHashId,
  licenceMonitoringStations,
  recipientLicenceRefs,
  removedThresholds,
  sessionId
) {
  const relevantLicenceMonitoringStations = DetermineRelevantLicenceMonitoringStationsService.go(
    licenceMonitoringStations,
    alertThresholds,
    removedThresholds,
    alertType
  )

  const recipientRelevantLicenceMonitoringStations = relevantLicenceMonitoringStations.filter(
    (relevantLicenceMonitoringStation) => {
      return recipientLicenceRefs.includes(relevantLicenceMonitoringStation.licence.licenceRef)
    }
  )

  const preparedLicenceMonitoringStations = recipientRelevantLicenceMonitoringStations.map(
    (licenceMonitoringStation) => {
      return {
        ...licenceMonitoringStation,
        action: _action(contactHashId, sessionId, licenceMonitoringStation),
        statusUpdatedAt: licenceMonitoringStation.statusUpdatedAt
          ? new Date(licenceMonitoringStation.statusUpdatedAt)
          : null
      }
    }
  )

  return formatRestrictions(preparedLicenceMonitoringStations)
}

module.exports = {
  go
}
