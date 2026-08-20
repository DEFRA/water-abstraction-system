/**
 * Formats data for the `/notices/setup/{sessionId}/preview/{contactHashId}/check-alert` page
 * @module PreviewCheckAlertPresenter
 */

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
export default function previewCheckAlertPresenter(contactHashId, recipientLicenceRefs, session) {
  const { id: sessionId, referenceCode, relevantLicenceMonitoringStations } = session

  const recipientLicenceMonitoringStations = _recipientLicenceMonitoringStations(
    recipientLicenceRefs,
    relevantLicenceMonitoringStations
  )

  return {
    backLink: { href: `/system/notices/setup/${sessionId}/check`, text: 'Back' },
    pageTitle: 'Check the recipient previews',
    pageTitleCaption: `Notice ${referenceCode}`,
    restrictionHeading: determineRestrictionHeading(recipientLicenceMonitoringStations),
    restrictions: _restrictions(contactHashId, recipientLicenceMonitoringStations, sessionId)
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

function _recipientLicenceMonitoringStations(recipientLicenceRefs, relevantLicenceMonitoringStations) {
  return relevantLicenceMonitoringStations.filter((relevantLicenceMonitoringStation) => {
    return recipientLicenceRefs.includes(relevantLicenceMonitoringStation.licence.licenceRef)
  })
}
