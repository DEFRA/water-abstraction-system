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
    lastAlertSent: _lastAlertSent(licenceMonitoringStations),
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

function _lastAlertSent(licenceMonitoringStations) {
  // Filter out those without an abstraction alert
  const licenceMonitoringStationsWithAlerts = licenceMonitoringStations.filter((licenceMonitoringStation) => {
    return licenceMonitoringStation.latestNotification
  })

  if (!licenceMonitoringStationsWithAlerts.length) {
    return null
  }

  let lastAlert = licenceMonitoringStationsWithAlerts[0].latestNotification

  for (const licenceMonitoringStationsWithAlert of licenceMonitoringStationsWithAlerts) {
    if (licenceMonitoringStationsWithAlert.latestNotification.createdAt > lastAlert.createdAt) {
      lastAlert = licenceMonitoringStationsWithAlert.latestNotification
    }
  }

  const createdAtDate = new Date(lastAlert.createdAt)

  return `${sentenceCase(lastAlert.sendingAlertType)} alert sent on ${formatLongDate(createdAtDate)}`
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
      licenceVersionPurposeCondition,
      restrictionType,
      thresholdUnit,
      thresholdValue,
      user
    } = licenceMonitoringStation

    const created = _created(createdAt, user)
    const tag = `${formatRestrictionType(restrictionType)} tag`

    return {
      actions: _actions(canRemoveTags, licenceMonitoringStationId, tag, created),
      created,
      displaySupersededWarning: _displaySupersededWarning(licenceVersionPurposeCondition),
      effectOfRestriction: _effectOfRestriction(licenceVersionPurposeCondition),
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
