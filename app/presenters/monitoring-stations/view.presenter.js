'use strict'

/**
 * Formats the monitoring station and related licence monitoring station data for the view monitoring station page
 * @module ViewPresenter
 */

const { formatAbstractionPeriod, formatLongDate, sentenceCase } = require('../base.presenter.js')

/**
 * Formats the monitoring station and related licence monitoring station data for the view monitoring station page
 *
 * A licence can be tagged to a monitoring station more than once. A common example we see is where a licence has been
 * tagged with a 'reduce' restriction, and then tagged again at a lower threshold with a 'stop' restriction.
 *
 * This results in two licence monitoring station records. When we display them on the page, we want to show both
 * records but the licence reference (and link to it) only once.
 *
 * We solve this by using the 'rowspan' property of the first cell that holds the licence ref and link. So, no need for
 * grouping by licence here!
 *
 * The other key thing the presenter has to deal with is what abstraction period to show. Those records linked to a
 * licence condition need to display the abstraction period on the associated licence purpose. Else the user will have
 * add an abstraction period against the licence monitoring station record when they tagged it.
 *
 * @param {module:MonitoringStationModel} monitoringStation - The monitoring station and associated licence monitoring
 * station data
 * @param {object} auth - The auth object taken from `request.auth`
 *
 * @returns {object} page data needed by the view template
 */
function go (monitoringStation, auth) {
  const {
    id: monitoringStationId,
    gridReference,
    label: monitoringStationName,
    licenceMonitoringStations,
    riverName,
    stationReference,
    wiskiId
  } = monitoringStation

  return {
    gridReference,
    monitoringStationId,
    pageTitle: _pageTitle(riverName, monitoringStationName),
    permissionToManageLinks: auth.credentials.scope.includes('manage_gauging_station_licence_links'),
    permissionToSendAlerts: auth.credentials.scope.includes('hof_notifications'),
    restrictions: _restrictions(licenceMonitoringStations),
    stationReference,
    wiskiId
  }
}

function _abstractionPeriod (licenceMonitoringStation) {
  const {
    abstractionPeriodEndDay: stationEndDay,
    abstractionPeriodEndMonth: stationEndMonth,
    abstractionPeriodStartDay: stationStartDay,
    abstractionPeriodStartMonth: stationStartMonth,
    licenceVersionPurposeCondition
  } = licenceMonitoringStation

  if (licenceVersionPurposeCondition) {
    const {
      abstractionPeriodEndDay: purposeEndDay,
      abstractionPeriodEndMonth: purposeEndMonth,
      abstractionPeriodStartDay: purposeStartDay,
      abstractionPeriodStartMonth: purposeStartMonth
    } = licenceVersionPurposeCondition.licenceVersionPurpose

    return formatAbstractionPeriod(purposeStartDay, purposeStartMonth, purposeEndDay, purposeEndMonth)
  }

  return formatAbstractionPeriod(stationStartDay, stationStartMonth, stationEndDay, stationEndMonth)
}

function _alert (status, statusUpdatedAt) {
  if (!statusUpdatedAt) {
    return null
  }

  return sentenceCase(status)
}

function _restrictions (licenceMonitoringStations) {
  return licenceMonitoringStations.map((licenceMonitoringStation) => {
    const {
      licence,
      measureType,
      restrictionType,
      status,
      statusUpdatedAt,
      thresholdUnit,
      thresholdValue
    } = licenceMonitoringStation

    return {
      abstractionPeriod: _abstractionPeriod(licenceMonitoringStation),
      alert: _alert(status, statusUpdatedAt),
      alertDate: statusUpdatedAt ? formatLongDate(statusUpdatedAt) : null,
      licenceId: licence.id,
      licenceRef: licence.licenceRef,
      measure: sentenceCase(measureType),
      restriction: _restriction(restrictionType),
      restrictionCount: _restrictionCount(licence.id, licenceMonitoringStations),
      threshold: `${thresholdValue} ${thresholdUnit}`
    }
  })
}

function _restriction (restrictionType) {
  if (restrictionType === 'stop_or_reduce') {
    return 'Stop or reduce'
  }

  return sentenceCase(restrictionType)
}

function _restrictionCount (licenceId, licenceMonitoringStations) {
  const count = licenceMonitoringStations.filter((licenceMonitoringStation) => {
    return licenceMonitoringStation.licenceId === licenceId
  })

  return count.length
}

function _pageTitle (riverName, stationName) {
  if (riverName) {
    return `${riverName} at ${stationName}`
  }

  return stationName
}

module.exports = {
  go
}
