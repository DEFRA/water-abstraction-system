'use strict'

/**
 * Formats the monitoring station details and related licences data for the
 * `/monitoring-stations/{monitoringStationId}/view` page
 * @module ViewMonitoringStationsPresenter
 */

const { formatAbstractionPeriod, formatLongDate } = require('../base.presenter.js')

/**
 * Formats the monitoring station details and related licences data for the
 * `/monitoring-stations/{monitoringStationId}/view` page
 *
 * @param {string} auth - The auth object taken from `request.auth` containing user details
 * @param {GaugingStationModel[]} monitoringStation - The monitoring station and associated licences data returned
 * by FetchMonitoringStations
 *
 * @returns {object} monitoring station and licence data needed by the view template
 */
function go (auth, monitoringStation) {
  const formattedLicences = formatLicences(monitoringStation.licenceGaugingStations)
  const sortedLicences = sortLicences(formattedLicences)
  const groupedLicences = groupLicences(sortedLicences)

  return {
    pageTitle: createPageTitle(monitoringStation.riverName, monitoringStation.label),
    monitoringStationId: monitoringStation.id,
    monitoringStationName: monitoringStation.label,
    gridReference: monitoringStation.gridReference,
    hasPermissionToManageLinks: checkPermissions(auth, 'manage_gauging_station_licence_links'),
    hasPermissionToSendAlerts: checkPermissions(auth, 'hof_notifications'),
    wiskiId: monitoringStation.wiskiId,
    stationReference: monitoringStation.stationReference,
    licences: groupedLicences
  }
}

function formatLicences (licenceDetails) {
  return licenceDetails.map((licenceDetail) => {
    return {
      abstractionPeriod: formatLicenceDetailsAbstractionPeriod(licenceDetail),
      alertType: alertType(licenceDetail),
      alertUpdatedAt: alertedUpdatedAt(licenceDetail),
      createdAt: licenceDetail.createdAt,
      lastUpdatedAt: licenceDetail.statusUpdatedAt,
      id: licenceDetail.licence.id,
      licenceRef: licenceDetail.licence.licenceRef,
      restrictionType: licenceDetail.restrictionType === 'flow' ? 'Flow' : 'Level',
      threshold: `${licenceDetail.thresholdValue} ${licenceDetail.thresholdUnit}`
    }
  })
}

function sortLicences (licences) {
  return licences.sort((licenceA, licenceB) => {
    if (licenceA.licenceRef > licenceB.licenceRef) {
      return 1
    }

    if (licenceA.licenceRef < licenceB.licenceRef) {
      return -1
    }

    if (licenceA.lastUpdatedAt && licenceB.lastUpdatedAt) {
      if (licenceA.lastUpdatedAt > licenceB.lastUpdatedAt) {
        return -1
      }

      if (licenceA.lastUpdatedAt < licenceB.lastUpdatedAt) {
        return 1
      }
    }

    if (licenceA.lastUpdatedAt && !licenceB.lastUpdatedAt) {
      return -1
    }

    if (!licenceA.lastUpdatedAt && licenceB.lastUpdatedAt) {
      return 1
    }

    if (licenceA.createdAt > licenceB.createdAt) {
      return -1
    }

    if (licenceA.createdAt < licenceB.createdAt) {
      return 1
    }

    return 0
  })
}

function alertType (licence) {
  if (licence.alertType === 'stop') {
    return 'Stop'
  }

  if (licence.alertType === 'reduce') {
    return 'Reduce'
  }

  return 'Stop or reduce'
}

function checkPermissions (auth, roleType) {
  return auth.credentials.roles.some((role) => {
    return role.role === roleType
  })
}

function groupLicences (licences) {
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

function alertedUpdatedAt (licenceDetails) {
  if (licenceDetails.statusUpdatedAt) {
    return formatLongDate(licenceDetails.statusUpdatedAt)
  }

  return formatLongDate(licenceDetails.createdAt)
}

function createPageTitle (riverName, stationName) {
  if (riverName) {
    return `${riverName} at ${stationName}`
  }

  return stationName
}

function formatLicenceDetailsAbstractionPeriod (licenceDetails) {
  return formatAbstractionPeriod(
    licenceDetails.abstractionPeriodStartDay,
    licenceDetails.abstractionPeriodStartMonth,
    licenceDetails.abstractionPeriodEndDay,
    licenceDetails.abstractionPeriodEndMonth
  )
}

module.exports = {
  go
}
