'use strict'

/**
 * Orchestrates saving the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @module SubmitCheckLicenceMatchesService
 */

const DetermineRelevantLicenceMonitoringStationsService = require('./determine-relevant-licence-monitoring-stations.service.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates saving the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @param {string} sessionId
 *
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  await _save(session)
}

async function _save(session) {
  const { alertThresholds, licenceMonitoringStations, removedThresholds, alertType } = session

  const relevantLicenceMonitoringStations = DetermineRelevantLicenceMonitoringStationsService.go(
    licenceMonitoringStations,
    alertThresholds,
    removedThresholds,
    alertType
  )

  const relevantLicenceRefs = relevantLicenceMonitoringStations.map((station) => {
    return station.licence.licenceRef
  })

  session.licenceRefs = Array.from(new Set(relevantLicenceRefs))
  session.relevantLicenceMonitoringStations = relevantLicenceMonitoringStations

  // This is needed for users who have gone through the journey as far as the 'Check recipients' page, then clicked
  // back and made a change that alters which recipients are applicable.
  //
  // When you hit the 'Check recipients' page, if `selectedRecipients` does not exist it will initialise it with all
  // recipients. Certain journeys can then alter which recipients will receive a notification, which will change the
  // content of `selectedRecipients`, and what gets displayed on the page.
  //
  // Should a user go back though, what was previously 'selected' becomes void because of changes made, hence we need
  // to delete it so the 'Check recipients' page can re-initialise with all recipients.
  delete session.selectedRecipients

  return session.$update()
}

module.exports = {
  go
}
