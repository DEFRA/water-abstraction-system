/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 * @module CheckLicenceMatchesPresenter
 */

import { formatAbstractionPeriod } from 'water-abstraction-engine/presenters/base.presenter.js'

import DetermineRelevantLicenceMonitoringStationsService from '../../../../services/notices/setup/abstraction-alerts/determine-relevant-licence-monitoring-stations.service.js'
import { determineRestrictionHeading, formatRestrictions } from '../../../monitoring-stations/base.presenter.js'

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @param {module:SessionModel} session - The session instance
 * @param {object} query - Express request query object
 * @returns {object} - The data formatted for the view template
 */
export default function checkLicenceMatchesPresenter(session, query = {}) {
  const allStations = _relevantLicenceMonitoringStations(session)

  // Normalize selected period query params into an array
  const selectedPeriods = Array.isArray(query.periods) ? query.periods : query.periods ? [query.periods] : []

  // Filter stations based on selected periods (if any are selected)
  const filteredStations = _filterStationsByPeriods(allStations, selectedPeriods)

  return {
    backLink: { href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-thresholds`, text: 'Back' },
    cancelLink: `/system/notices/setup/${session.id}/abstraction-alerts/cancel`,
    pageTitle: 'Check the licence matches for the selected thresholds',
    pageTitleCaption: session.monitoringStationName,
    restrictions: _restrictions(filteredStations, session.id, selectedPeriods),
    restrictionHeading: determineRestrictionHeading(filteredStations),
    // The filter options must always list every period for this alert, even ones a previous filter submission
    // removed from `allStations`, otherwise a period the user filtered out becomes impossible to bring back
    filter: _filter(session.id, selectedPeriods, _allLicenceMonitoringStations(session))
  }
}

function _action(sessionId, licenceMonitoringStation, selectedPeriods) {
  const queryString = _periodsQueryString(selectedPeriods)

  return {
    link: `/system/notices/setup/${sessionId}/abstraction-alerts/remove-threshold/${licenceMonitoringStation.id}${queryString}`,
    text: 'Remove'
  }
}

function _periodsQueryString(selectedPeriods) {
  if (selectedPeriods.length === 0) {
    return ''
  }

  const params = new URLSearchParams()

  selectedPeriods.forEach((period) => {
    params.append('periods', period)
  })

  return `?${params.toString()}`
}

function _relevantLicenceMonitoringStations(session) {
  const { alertThresholds, alertType, licenceMonitoringStations, removedThresholds } = session

  return DetermineRelevantLicenceMonitoringStationsService(
    licenceMonitoringStations,
    alertThresholds,
    removedThresholds,
    alertType
  )
}

function _allLicenceMonitoringStations(session) {
  const { alertThresholds, alertType, licenceMonitoringStations } = session

  return DetermineRelevantLicenceMonitoringStationsService(licenceMonitoringStations, alertThresholds, null, alertType)
}

function _getPeriodValue(station) {
  const {
    abstractionPeriodStartDay: startDay,
    abstractionPeriodStartMonth: startMonth,
    abstractionPeriodEndDay: endDay,
    abstractionPeriodEndMonth: endMonth
  } = station

  return `${startDay}-${startMonth}-${endDay}-${endMonth}`
}

function _filterStationsByPeriods(stations, selectedPeriods) {
  if (selectedPeriods.length === 0) {
    return stations
  }

  return stations.filter((station) => {
    const periodValue = _getPeriodValue(station)
    return selectedPeriods.includes(periodValue)
  })
}

function _restrictions(relevantLicenceMonitoringStations, sessionId, selectedPeriods) {
  const multipleRestrictions = relevantLicenceMonitoringStations.length > 1

  const preparedLicenceMonitoringStations = relevantLicenceMonitoringStations.map((licenceMonitoringStation) => {
    return {
      ...licenceMonitoringStation,
      action: multipleRestrictions ? _action(sessionId, licenceMonitoringStation, selectedPeriods) : null,
      statusUpdatedAt: licenceMonitoringStation.statusUpdatedAt
        ? new Date(licenceMonitoringStation.statusUpdatedAt)
        : null
    }
  })

  return formatRestrictions(preparedLicenceMonitoringStations)
}

function _filter(sessionId, selectedPeriods, allStations) {
  const periodMap = new Map()

  allStations.forEach((station) => {
    const value = _getPeriodValue(station)

    if (!periodMap.has(value)) {
      const text = formatAbstractionPeriod(
        station.abstractionPeriodStartDay,
        station.abstractionPeriodStartMonth,
        station.abstractionPeriodEndDay,
        station.abstractionPeriodEndMonth
      )

      periodMap.set(value, {
        text,
        value,
        checked: selectedPeriods.includes(value)
      })
    }
  })

  return {
    clearLink: `/system/notices/setup/${sessionId}/abstraction-alerts/check-licence-matches`,
    periods: Array.from(periodMap.values()),
    openFilter: selectedPeriods.length > 0
  }
}
