'use strict'

/**
 * Format data for the `/monitoring-stations/{monitoringStationId}/licence/{licenceId}` page
 * @module ViewLicencePresenter
 */

const { formatLongDate, formatValueUnit, sentenceCase } = require('../base.presenter.js')
const { formatRestrictionType } = require('./base.presenter.js')

/**
 * Format data for the `/monitoring-stations/{monitoringStationId}/licence/{licenceId}` page
 *
 * @param {module:LicenceModel} licence - The selected licence
 * @param {module:LicenceMonitoringStationModel} licenceMonitoringStations - The licence monitoring stations and
 * associated data for the selected licence and monitoring station
 * @param {module:MonitoringStationModel} monitoringStation - The monitoring station the user is viewing licence tag
 * data
 * @param {object} auth - The auth object taken from `request.auth`
 *
 * @returns {object} page data needed by the view template
 */
function go(licence, licenceMonitoringStations, monitoringStation, auth) {
  const canRemoveTags = auth.credentials.scope.includes('manage_gauging_station_licence_links')

  return {
    backLink: { href: `/system/monitoring-stations/${monitoringStation.id}`, text: 'Go back to monitoring station' },
    lastAlertSentForLicence: _lastAlertSentForLicence(licenceMonitoringStations),
    licenceTags: _licenceTags(licenceMonitoringStations, canRemoveTags),
    pageTitle: `Details for ${licence.licenceRef}`,
    pageTitleCaption: _monitoringStationName(monitoringStation)
  }
}

function _actions(canRemoveTags, licenceMonitoringStationId, tag, created) {
  if (!canRemoveTags) {
    return null
  }

  return {
    items: [
      {
        href: `/system/licence-monitoring-station/${licenceMonitoringStationId}/remove`,
        text: 'Remove tag',
        visuallyHiddenText: `Remove ${tag} ${created}`
      }
    ]
  }
}

function _created(createdAt, user) {
  const createdOn = `Created on ${formatLongDate(createdAt)}`

  if (user) {
    return `${createdOn} by ${user.username}`
  }

  return createdOn
}

function _displaySupersededWarning(licenceVersionPurposeCondition) {
  if (!licenceVersionPurposeCondition) {
    return false
  }

  return licenceVersionPurposeCondition.licenceVersionPurpose.licenceVersion.status === 'superseded'
}

function _effectOfRestriction(licenceVersionPurposeCondition) {
  if (!licenceVersionPurposeCondition) {
    return null
  }

  return licenceVersionPurposeCondition.notes
}

function _lastAlertSent(latestNotification) {
  if (!latestNotification) {
    return ''
  }

  const { addressLine1, createdAt, messageType, recipient, sendingAlertType } = latestNotification
  const createdAtDate = new Date(createdAt)
  const receiver = messageType === 'email' ? recipient : addressLine1

  return `${sentenceCase(sendingAlertType)} ${messageType} on ${formatLongDate(createdAtDate)} sent to ${receiver}`
}

function _lastAlertSentForLicence(licenceMonitoringStations) {
  // Filter out those without an abstraction alert
  const licenceMonitoringStationsWithAlerts = licenceMonitoringStations.filter((licenceMonitoringStation) => {
    return licenceMonitoringStation.latestNotification
  })

  if (!licenceMonitoringStationsWithAlerts.length) {
    return null
  }

  let lastAlertSent = licenceMonitoringStationsWithAlerts[0].latestNotification

  for (const licenceMonitoringStationsWithAlert of licenceMonitoringStationsWithAlerts) {
    if (licenceMonitoringStationsWithAlert.latestNotification.createdAt > lastAlertSent.createdAt) {
      lastAlertSent = licenceMonitoringStationsWithAlert.latestNotification
    }
  }

  return _lastAlertSent(lastAlertSent)
}

function _licenceCondition(licenceVersionPurposeCondition) {
  if (!licenceVersionPurposeCondition) {
    return 'Not linked to a condition'
  }

  const { externalId, licenceVersionPurposeConditionType } = licenceVersionPurposeCondition

  const naldId = externalId.split(':').pop() // Get the last set of digits from the externalId

  return `${licenceVersionPurposeConditionType.displayTitle}, NALD ID ${naldId}`
}

function _licenceTags(licenceMonitoringStations, canRemoveTags) {
  return licenceMonitoringStations.map((licenceMonitoringStation) => {
    const {
      id: licenceMonitoringStationId,
      createdAt,
      latestNotification,
      licenceVersionPurposeCondition,
      restrictionType,
      thresholdUnit,
      thresholdValue,
      user
    } = licenceMonitoringStation

    const created = _created(createdAt, user)
    const lastAlertSent = licenceMonitoringStations.length === 1 ? null : _lastAlertSent(latestNotification)
    const tag = `${formatRestrictionType(restrictionType)} tag`

    return {
      actions: _actions(canRemoveTags, licenceMonitoringStationId, tag, created),
      created,
      displaySupersededWarning: _displaySupersededWarning(licenceVersionPurposeCondition),
      effectOfRestriction: _effectOfRestriction(licenceVersionPurposeCondition),
      lastAlertSent,
      licenceMonitoringStationId,
      linkedCondition: _licenceCondition(licenceVersionPurposeCondition),
      tag,
      threshold: formatValueUnit(thresholdValue, thresholdUnit),
      type: formatRestrictionType(restrictionType)
    }
  })
}

function _monitoringStationName(monitoringStation) {
  const { label, riverName } = monitoringStation

  if (riverName) {
    return `${riverName} at ${label}`
  }

  return label
}

module.exports = {
  go
}
