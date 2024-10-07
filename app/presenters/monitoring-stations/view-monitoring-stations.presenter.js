'use strict'

/**
 * Formats the monitoring station details and related licences data for the view monitoring-station  page
 * @module ViewMonitoringStationsPresenter
 */

const { formatAbstractionPeriod, formatLongDate } = require('../base.presenter.js')

/**
 * Formats the monitoring station details and related licences data for the view monitoring-station  page
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
    licences: groupedLicences,
    monitoringStationId: monitoringStation.id,
    monitoringStationName: monitoringStation.label,
    pageTitle: _pageTitle(monitoringStation.riverName, monitoringStation.label),
    permissionToManageLinks: auth.credentials.scope.includes('manage_gauging_station_licence_links'),
    permissionToSendAlerts: auth.credentials.scope.includes('hof_notifications'),
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

/**
 * This function groups licence objects by their unique `id`.
 *
 * It takes the array of licences and uses the `reduce` method to accumulate an object, where each key is a licence
 * `id`. For each unique `id`, a new object is created with `licenceId`, `licenceRef`, and an empty `linkages` array.
 * The current licence object is then pushed into the `linkages` array of the corresponding group. Finally, the grouped
 * licences are returned as an array of these grouped objects.
 *
 * ```javascript
 * [
 *   {
 *     licenceId: 'bf1befed-2ece-4805-89fd-3056a5cf5020',
 *     licenceRef: '01/0157',
 *     linkages: [
 *       {
 *         alertType: 'Reduce',
 *         abstractionPeriod: '1 April to 31 August',
 *         alertUpdatedAt: '26 September 2024',
 *         createdAt: 2024-09-26T09:34:54.152Z,
 *         lastUpdatedAt: null,
 *         id: 'bf1befed-2ece-4805-89fd-3056a5cf5020',
 *         licenceRef: '01/0157',
 *         restrictionType: 'Level',
 *         threshold: '700 mAOD'
 *       }
 *     ]
 *   }
 * ]
 * ```
 *
 * @param {object[]} licences - The sorted licences returned by the _sortLicences() function
 *
 * @returns {object[]} grouped licences array where each item is an object with licence details and linked licences
 */
function _groupLicences (licences) {
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

function _pageTitle (riverName, stationName) {
  if (riverName) {
    return `${riverName} at ${stationName}`
  }

  return stationName
}

function _sortLicences (licences) {
  // NOTE: Sorting the licences in order of `licenceRef` proved difficult to complete as licences are fetched by those
  // linked to a licence gauging station, where the licence reference is stored inside the nested licence object.
  // However, by extracting and comparing `licenceRef` directly within the sort function, we can order the licences
  // alphabetically. The sort logic below compares the `licenceRef` of each licence and orders them in ascending order.
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
