/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 * @module CheckLicenceMatchesPresenter
 */

import { formatAbstractionPeriod } from 'water-abstraction-engine/presenters/base.presenter.js'
import { processSavedFilters } from 'water-abstraction-engine/lib/submit-page.lib.js'

import DetermineRelevantLicenceMonitoringStationsService from '../../../../services/notices/setup/abstraction-alerts/determine-relevant-licence-monitoring-stations.service.js'
import { determineRestrictionHeading, formatRestrictions } from '../../../monitoring-stations/base.presenter.js'

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @param {module:SessionModel} session - The session instance
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @returns {object} - The data formatted for the view template
 */
export default function checkLicenceMatchesPresenter(session, yar) {
  const allStations = _relevantLicenceMonitoringStations(session)

  const savedFilter = processSavedFilters(yar, `checkLicenceMatchesFilter-${session.id}`)

  // Drop any saved period that no longer matches a station, for example because the last station with that period
  // has since been removed. Otherwise the table would stay stuck filtered down to nothing with no visible reason
  const availablePeriods = allStations.map(_getPeriodValue)
  const selectedPeriods = (savedFilter.periods ?? []).filter((period) => {
    return availablePeriods.includes(period)
  })

  // Filter stations based on selected periods (if any are selected)
  const filteredStations = _filterStationsByPeriods(allStations, selectedPeriods)

  return {
    backLink: { href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-thresholds`, text: 'Back' },
    cancelLink: `/system/notices/setup/${session.id}/abstraction-alerts/cancel`,
    pageTitle: 'Check the licence matches for the selected thresholds',
    pageTitleCaption: session.monitoringStationName,
    restrictions: _restrictions(filteredStations, session.id),
    restrictionHeading: determineRestrictionHeading(filteredStations),
    // Built from `allStations` (not `filteredStations`) so every period still available stays selectable, even
    // when it isn't part of the current filter selection. A period disappears once no station has it any more,
    // for example once the last station with that period has been removed
    filter: _filter(session.id, selectedPeriods, selectedPeriods.length > 0, allStations)
  }
}

function _action(sessionId, licenceMonitoringStation) {
  return {
    link: `/system/notices/setup/${sessionId}/abstraction-alerts/remove-threshold/${licenceMonitoringStation.id}`,
    text: 'Remove'
  }
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

function _restrictions(relevantLicenceMonitoringStations, sessionId) {
  const multipleRestrictions = relevantLicenceMonitoringStations.length > 1

  const preparedLicenceMonitoringStations = relevantLicenceMonitoringStations.map((licenceMonitoringStation) => {
    return {
      ...licenceMonitoringStation,
      action: multipleRestrictions ? _action(sessionId, licenceMonitoringStation) : null,
      statusUpdatedAt: licenceMonitoringStation.statusUpdatedAt
        ? new Date(licenceMonitoringStation.statusUpdatedAt)
        : null
    }
  })

  return formatRestrictions(preparedLicenceMonitoringStations)
}

function _filter(sessionId, selectedPeriods, openFilter, allStations) {
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
    actionLink: `/system/notices/setup/${sessionId}/abstraction-alerts/check-licence-matches/filter`,
    periods: Array.from(periodMap.values()),
    openFilter
  }
}
