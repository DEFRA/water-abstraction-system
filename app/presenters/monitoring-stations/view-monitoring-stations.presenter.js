'use strict'

/**
 * Formats the monitoring station details and related licences data for the
 * `/monitoring-stations/{monitoringStationId}` page
 * @module ViewMonitoringStationsPresenter
 */

const { formatAbstractionPeriod, formatLongDate } = require('../base.presenter.js')

/**
 * Formats the monitoring station details and related licences data for the
 * `/monitoring-stations/{monitoringStationId}` page
 *
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {module:GaugingStationModel[]} monitoringStation - The monitoring station and associated licences data
 * returned by `FetchMonitoringStationService`
 *
 * @returns {object} monitoring station and licence data needed by the view template
 */
function go (auth, monitoringStation) {
  const formattedLicences = _formatLicences(monitoringStation.licenceGaugingStations)
  const sortedLicences = _sortLicences(formattedLicences)
  const groupedLicences = _groupLicences(sortedLicences)

  return {
    gridReference: monitoringStation.gridReference,
    permissionToManageLinks: auth.credentials.scope.includes('manage_gauging_station_licence_links'),
    permissionToSendAlerts: auth.credentials.scope.includes('hof_notifications'),
    licences: groupedLicences,
    monitoringStationId: monitoringStation.id,
    monitoringStationName: monitoringStation.label,
    pageTitle: _pageTitle(monitoringStation.riverName, monitoringStation.label),
    stationReference: monitoringStation.stationReference,
    wiskiId: monitoringStation.wiskiId
  }
}

function _alertedUpdatedAt (licenceDetails) {
  if (licenceDetails.statusUpdatedAt) {
    return formatLongDate(licenceDetails.statusUpdatedAt)
  }

  return formatLongDate(licenceDetails.createdAt)
}

function _alertType (licence) {
  if (licence.alertType === 'stop') {
    return 'Stop'
  }

  if (licence.alertType === 'reduce') {
    return 'Reduce'
  }

  return 'Stop or reduce'
}

function _pageTitle (riverName, stationName) {
  if (riverName) {
    return `${riverName} at ${stationName}`
  }

  return stationName
}

function _formatLicenceDetailsAbstractionPeriod (licenceDetails) {
  return formatAbstractionPeriod(
    licenceDetails.abstractionPeriodStartDay,
    licenceDetails.abstractionPeriodStartMonth,
    licenceDetails.abstractionPeriodEndDay,
    licenceDetails.abstractionPeriodEndMonth
  )
}

function _formatLicences (licenceDetails) {
  return licenceDetails.map((licenceDetail) => {
    return {
      abstractionPeriod: _formatLicenceDetailsAbstractionPeriod(licenceDetail),
      alertType: _alertType(licenceDetail),
      alertUpdatedAt: _alertedUpdatedAt(licenceDetail),
      createdAt: licenceDetail.createdAt,
      lastUpdatedAt: licenceDetail.statusUpdatedAt,
      id: licenceDetail.licence.id,
      licenceRef: licenceDetail.licence.licenceRef,
      restrictionType: licenceDetail.restrictionType === 'flow' ? 'Flow' : 'Level',
      threshold: `${licenceDetail.thresholdValue} ${licenceDetail.thresholdUnit}`
    }
  })
}

function _groupLicences (licences) {
  // NOTE: This function groups licence objects by their unique `id`. It takes the array of licences and uses the
  // `reduce` method to accumulate an object, where each key is a licence `id`. For each unique `id`, a new object is
  // created with `licenceId`, `licenceRef`, and an empty `linkages` array. The current licence object is then pushed
  // into the `linkages` array of the corresponding group. Finally, the grouped licences are returned as an array of
  // these grouped objects.
  const groupedLicences = licences.reduce((grouped, current) => {
    const { id, licenceRef } = current

    if (!grouped[id]) {
      grouped[id] = {
        licenceId: id,
        licenceRef,
        linkages: []
      }
    }

    grouped[id].linkages.push(current)

    return grouped
  }, {})

  return Object.values(groupedLicences)
}

function _sortLicences (licences) {
  return licences.sort((licenceA, licenceB) => {
    if (licenceA.licenceRef !== licenceB.licenceRef) {
      return licenceA.licenceRef < licenceB.licenceRef ? -1 : 1
    }

    return 0
  })
}

module.exports = {
  go
}
