'use strict'

/**
 * Formats the monitoring station and related licence monitoring station data for the view monitoring station page
 * @module ViewPresenter
 */

const { determineRestrictionHeading, formatRestrictions } = require('./base.presenter.js')

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
 * added an abstraction period against the licence monitoring station record when they tagged it.
 *
 * @param {object} auth - The auth object taken from `request.auth`
 * @param {module:MonitoringStationModel} monitoringStation - The monitoring station and associated licence monitoring
 * station data
 *
 * @returns {object} page data needed by the view template
 */
function go(auth, monitoringStation) {
  const {
    id: monitoringStationId,
    catchmentName,
    gridReference,
    label: monitoringStationName,
    licenceMonitoringStations,
    riverName,
    stationReference,
    wiskiId
  } = monitoringStation

  const restrictions = _restrictions(licenceMonitoringStations, monitoringStationId)

  return {
    backLink: { href: '/licences', text: 'Go back to search' },
    buttons: {
      createAlert: _createAlertButton(restrictions, auth, monitoringStationId),
      tagLicence: _tagLicenceButton(auth, monitoringStationId),
    },
    gridReference: gridReference ?? '',
    pageTitle: _pageTitle(riverName, monitoringStationName),
    pageTitleCaption: catchmentName ?? null,
    restrictionHeading: determineRestrictionHeading(licenceMonitoringStations),
    restrictions,
    stationReference: stationReference ?? '',
    wiskiId: wiskiId ?? ''
  }
}

function _createAlertButton(restrictions, auth, monitoringStationId) {
  if (restrictions.length === 0) {
    return null
  }

  if (!auth.credentials.scope.includes('hof_notifications')) {
    return null
  }

  return {
    href: `/system/notices/setup/alerts?monitoringStationId=${monitoringStationId}`
  }
}

function _licenceVersionPurpose(licenceVersionPurposeCondition) {
  if (licenceVersionPurposeCondition?.licenceVersionPurpose) {
    return licenceVersionPurposeCondition.licenceVersionPurpose
  } else {
    return {}
  }
}

function _pageTitle(riverName, stationName) {
  if (riverName) {
    return `${riverName} at ${stationName}`
  }

  return stationName
}

function _restrictions(licenceMonitoringStations, monitoringStationId) {
  const preparedLicenceMonitoringStations = licenceMonitoringStations.map((licenceMonitoringStation) => {
    const { licence } = licenceMonitoringStation

    const action = {
      link: `/system/monitoring-stations/${monitoringStationId}/licence/${licence.id}`,
      text: 'View'
    }

    return {
      ...licenceMonitoringStation,
      ..._licenceVersionPurpose(licenceMonitoringStation.licenceVersionPurposeCondition),
      action
    }
  })

  return formatRestrictions(preparedLicenceMonitoringStations)
}

function _tagLicenceButton(auth, monitoringStationId) {
  if (!auth.credentials.scope.includes('manage_gauging_station_licence_links')) {
    return null
  }

  return {
    value: monitoringStationId
  }
}

module.exports = {
  go
}
