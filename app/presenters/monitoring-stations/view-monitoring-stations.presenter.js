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
  return {
    monitoringStationName: monitoringStation.label,
    gridReference: monitoringStation.gridReference,
    hasPermissionToManageLinks: checkPermissions(auth, 'manage_gauging_station_licence_links'),
    hasPermissionToSendAlerts: checkPermissions(auth, 'hof_notifications'),
    wiskiId: monitoringStation.wiskiId,
    stationReference: monitoringStation.stationReference,
    licences: formatLicences(monitoringStation.licenceGaugingStations)
  }
}

function formatLicences (licenceDetails) {
  return licenceDetails.map((licenceDetail) => {
    return {
      abstractionPeriod: formatLicenceDetailsAbstractionPeriod(licenceDetail),
      alertType: licenceDetail.alertType,
      alertUpdatedAt: alertedUpdatedAt(licenceDetail),
      licenceRef: licenceDetail.licence.licenceRef,
      restrictionType: licenceDetail.restrictionType,
      threshold: `${licenceDetail.thresholdValue} ${licenceDetail.thresholdUnit}`
    }
  })

  return sortLicences(formattedLicences)
}

function sortLicences (licences) {
  const sortedLicences = licences.sort((licenceA, licenceB) => {
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

  return groupLicences(sortedLicences)
}

function checkPermissions (auth, roleType) {
  return auth.credentials.roles.some((role) => {
    return role.role === roleType
  })
}
}

function alertedUpdatedAt (licenceDetails) {
  if (licenceDetails.statusUpdatedAt) {
    return formatLongDate(licenceDetails.statusUpdatedAt)
  }

  return formatLongDate(licenceDetails.createdAt)
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
