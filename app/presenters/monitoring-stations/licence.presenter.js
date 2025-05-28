'use strict'

/**
 * Format data for the `/monitoring-stations/{monitoringStationId}/licence/{licenceId}` page
 * @module LicencePresenter
 */

const { formatLongDate, sentenceCase } = require('../base.presenter.js')

/**
 * Format data for the `/monitoring-stations/{monitoringStationId}/licence/{licenceId}` page
 *
 * @param {module:NotificationModel} lastAlert - The last water abstraction alert sent
 * @param {module:MonitoringStationModel} monitoringStationLicenceTags - The licence monitoring station and associated
 * licence tag data
 *
 * @returns {object} page data needed by the view template
 */
function go(lastAlert, monitoringStationLicenceTags) {
  const { id: monitoringStationId, label, licenceMonitoringStations, riverName } = monitoringStationLicenceTags
  const { licence } = licenceMonitoringStations[0]

  return {
    backLink: `/system/monitoring-stations/${monitoringStationId}`,
    lastAlertSent: _lastAlertSent(lastAlert),
    licenceTags: _licenceTags(licenceMonitoringStations),
    monitoringStationName: _monitoringStationName(label, riverName),
    pageTitle: `Details for ${licence.licenceRef}`
  }
}

function _created(createdAt, user) {
  const created = `Created on ${formatLongDate(createdAt)}`

  if (user) {
    return `${created} by ${user.username}`
  }

  return created
}

function _lastAlertSent(lastAlert) {
  if (lastAlert) {
    const { contact, createdAt, messageType, recipient, sendingAlertType } = lastAlert
    const receiver = messageType === 'email' ? recipient : contact

    return `${sentenceCase(sendingAlertType)} ${messageType} on ${formatLongDate(createdAt)} sent to ${receiver}`
  }

  return 'N/A'
}

function _licenceTags(licenceMonitoringStations) {
  return licenceMonitoringStations.map((licenceMonitoringStation) => {
    const { createdAt, licenceVersionPurposeCondition, restrictionType, thresholdUnit, thresholdValue, user } =
      licenceMonitoringStation

    const { effectOfRestriction, licenceVersionStatus, linkedCondition } =
      _linkedConditionDetails(licenceVersionPurposeCondition)

    return {
      created: _created(createdAt, user),
      effectOfRestriction,
      licenceVersionStatus,
      linkedCondition,
      tag: `${sentenceCase(restrictionType)} tag`,
      threshold: `${thresholdValue}${thresholdUnit}`,
      type: sentenceCase(restrictionType)
    }
  })
}

function _linkedConditionDetails(licenceVersionPurposeCondition) {
  if (licenceVersionPurposeCondition) {
    const { externalId, licenceVersionPurpose, licenceVersionPurposeConditionType, notes } =
      licenceVersionPurposeCondition

    const lastDigits = externalId.split(':').pop() // Get the last set digits from the externalId

    return {
      effectOfRestriction: notes ?? '',
      licenceVersionStatus: licenceVersionPurpose.licenceVersion.status,
      linkedCondition: `${licenceVersionPurposeConditionType.displayTitle}, NALD ID ${lastDigits}`
    }
  }

  return {
    effectOfRestriction: null,
    licenceVersionStatus: null,
    linkedCondition: 'Not linked to a condition'
  }
}

function _monitoringStationName(label, riverName) {
  if (riverName) {
    return `${riverName} at ${label}`
  }

  return label
}

module.exports = {
  go
}
