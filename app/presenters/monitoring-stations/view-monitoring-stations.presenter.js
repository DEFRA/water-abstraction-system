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
 * @param {GaugingStationModel[]} monitoringStation - The monitoring station and associated licences data returned
 * by FetchMonitoringStations
 *
 * @returns {object} monitoring station and licence data needed by the view template
 */
function go (monitoringStation) {
  return {
    monitoringStationName: monitoringStation.label,
    gridReference: monitoringStation.gridReference,
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
