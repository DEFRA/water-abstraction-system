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
 * @param {string} auth - The auth object taken from `request.auth` containing user details
 * @param {GaugingStationModel[]} monitoringStation - The monitoring station and associated licences data returned
 * by FetchMonitoringStations
 *
 * @returns {object} monitoring station and licence data needed by the view template
 */
function go (auth, monitoringStation) {
  const formattedLicences = _formatLicences(monitoringStation.licenceGaugingStations)
  const sortedLicences = _sortLicences(formattedLicences)
  const groupedLicences = _groupLicences(sortedLicences)

  return {
    gridReference: monitoringStation.gridReference,
    hasPermissionToManageLinks: _checkPermissions(auth, 'manage_gauging_station_licence_links'),
    hasPermissionToSendAlerts: _checkPermissions(auth, 'hof_notifications'),
    licences: groupedLicences,
    monitoringStationId: monitoringStation.id,
    monitoringStationName: monitoringStation.label,
    pageTitle: _createPageTitle(monitoringStation.riverName, monitoringStation.label),
    stationReference: monitoringStation.stationReference,
    wiskiId: monitoringStation.wiskiId
  }
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

function _alertType (licence) {
  if (licence.alertType === 'stop') {
    return 'Stop'
  }

  if (licence.alertType === 'reduce') {
    return 'Reduce'
  }

  return 'Stop or reduce'
}

function _alertedUpdatedAt (licenceDetails) {
  if (licenceDetails.statusUpdatedAt) {
    return formatLongDate(licenceDetails.statusUpdatedAt)
  }

  return formatLongDate(licenceDetails.createdAt)
}

function _checkPermissions (auth, roleType) {
  return auth.credentials.roles.some((role) => {
    return role.role === roleType
  })
}

function _createPageTitle (riverName, stationName) {
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

function _groupLicences (licences) {
  // NOTE: This function groups licence objects by their unique `id`. It takes the array of licences and uses the
  // `reduce` method to accumulate an object, where each key is a licence `id`. For each unique `id`, a new object is
  // created with `licenceId`, `licenceRef`, and an empty `linkages` array. The current licence object is then pushed
  // into the `linkages` array of the corresponding group. Finally, the grouped licences are returned as an array of
  // these grouped objects.
  const grouped = licences.reduce((acc, current) => {
    const { id, licenceRef } = current

    if (!acc[id]) {
      acc[id] = {
        licenceId: id,
        licenceRef,
        linkages: []
      }
    }

    acc[id].linkages.push(current)

    return acc
  }, {})

  return Object.values(grouped)
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
