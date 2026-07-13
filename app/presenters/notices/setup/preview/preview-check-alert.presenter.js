/**
 * Formats data for the `/notices/setup/{sessionId}/preview/{contactHashId}/check-alert` page
 * @module PreviewCheckAlertPresenter
 */

import DetermineRelevantLicenceMonitoringStationsService from '../../../../services/notices/setup/abstraction-alerts/determine-relevant-licence-monitoring-stations.service.js'
import { determineRestrictionHeading, formatRestrictions } from '../../../monitoring-stations/base.presenter.js'

/**
 * Formats data for the `/notices/setup/{sessionId}/preview/{contactHashId}/check-alert` page
 *
 * @param {string} contactHashId - The recipients unique identifier
 * @param {Array} recipientLicenceRefs - The references of the licences associated with the recipient
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
export default function (contactHashId, recipientLicenceRefs, session) {
  const recipientLicenceMonitoringStations = _recipientLicenceMonitoringStations(recipientLicenceRefs, session)

  return {
    backLink: { href: `/system/notices/setup/${session.id}/check`, text: 'Back' },
    pageTitle: 'Check the recipient previews',
    pageTitleCaption: `Notice ${session.referenceCode}`,
    restrictionHeading: determineRestrictionHeading(recipientLicenceMonitoringStations),
    restrictions: _restrictions(contactHashId, recipientLicenceMonitoringStations, session.id)
  }
}

function _action(contactHashId, sessionId, licenceMonitoringStation) {
  return {
    link: `/system/notices/setup/${sessionId}/preview/${contactHashId}/alert/${licenceMonitoringStation.id}`,
    text: 'Preview'
  }
}

function _restrictions(contactHashId, recipientLicenceMonitoringStations, sessionId) {
  const preparedLicenceMonitoringStations = _preparedLicenceMonitoringStations(
    contactHashId,
    recipientLicenceMonitoringStations,
    sessionId
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

  const relevantLicenceMonitoringStations = DetermineRelevantLicenceMonitoringStationsService(
    licenceMonitoringStations,
    alertThresholds,
    removedThresholds,
    alertType
  )

  return relevantLicenceMonitoringStations.filter((relevantLicenceMonitoringStation) => {
    return recipientLicenceRefs.includes(relevantLicenceMonitoringStation.licence.licenceRef)
  })
}
