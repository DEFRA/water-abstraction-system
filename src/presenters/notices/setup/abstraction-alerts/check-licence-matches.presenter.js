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
 * @param {object} filters - The filters object
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
export default function checkLicenceMatchesPresenter(filters, session) {
  const relevantLicenceMonitoringStations = _relevantLicenceMonitoringStations(session)

  // Drop any saved period filter that no longer matches a station. For example, because the last station with that
  // period has since been removed. Otherwise the table would stay stuck filtered down to nothing with no visible reason
  const availablePeriods = relevantLicenceMonitoringStations.map((relevantLicenceMonitoringStation) => {
    return _getPeriodValue(relevantLicenceMonitoringStation)
  })
  const selectedPeriods = filters.periods.filter((period) => {
    return availablePeriods.includes(period)
  })

  // Filter stations based on selected periods (if any are selected)
  const filteredLicenceMonitoringStations = _filterStationsByPeriods(relevantLicenceMonitoringStations, selectedPeriods)

  return {
    backLink: { href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-thresholds`, text: 'Back' },
    cancelLink: `/system/notices/setup/${session.id}/abstraction-alerts/cancel`,
    caption: _caption(filteredLicenceMonitoringStations, relevantLicenceMonitoringStations),
    filterActionLink: `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches/filter`,
    filterItems: _filterItems(selectedPeriods, relevantLicenceMonitoringStations),
    pageTitle: 'Check the licence matches for the selected thresholds',
    pageTitleCaption: session.monitoringStationName,
    restrictionHeading: determineRestrictionHeading(filteredLicenceMonitoringStations),
    restrictions: _restrictions(filteredLicenceMonitoringStations, session.id)
  }
}

function _action(sessionId, licenceMonitoringStation) {
  return {
    link: `/system/notices/setup/${sessionId}/abstraction-alerts/remove-threshold/${licenceMonitoringStation.id}`,
    text: 'Remove'
  }
}

function _caption(filteredLicenceMonitoringStations, relevantLicenceMonitoringStations) {
  const numberOfFilteredAlerts = filteredLicenceMonitoringStations.length
  const numberOfAlerts = relevantLicenceMonitoringStations.length

  if (numberOfFilteredAlerts === numberOfAlerts) {
    return `Showing all ${numberOfAlerts} abstraction alerts`
  }

  return `Showing ${numberOfFilteredAlerts} of ${numberOfAlerts} abstraction alerts`
}

function _filterItems(selectedPeriods, relevantLicenceMonitoringStations) {
  const periodMap = new Map()

  for (const relevantLicenceMonitoringStation of relevantLicenceMonitoringStations) {
    const value = _getPeriodValue(relevantLicenceMonitoringStation)

    if (!periodMap.has(value)) {
      const text = formatAbstractionPeriod(
        relevantLicenceMonitoringStation.abstractionPeriodStartDay,
        relevantLicenceMonitoringStation.abstractionPeriodStartMonth,
        relevantLicenceMonitoringStation.abstractionPeriodEndDay,
        relevantLicenceMonitoringStation.abstractionPeriodEndMonth
      )

      periodMap.set(value, {
        checked: selectedPeriods.includes(value),
        text,
        value
      })
    }
  }

  return Array.from(periodMap.values()).sort((firstItem, secondItem) => {
    return _sortByAbstractionPeriod(firstItem, secondItem)
  })
}

function _filterStationsByPeriods(relevantLicenceMonitoringStations, selectedPeriods) {
  if (selectedPeriods.length === 0) {
    return relevantLicenceMonitoringStations
  }

  return relevantLicenceMonitoringStations.filter((relevantLicenceMonitoringStation) => {
    const periodValue = _getPeriodValue(relevantLicenceMonitoringStation)

    return selectedPeriods.includes(periodValue)
  })
}

function _getPeriodValue(relevantLicenceMonitoringStation) {
  const {
    abstractionPeriodStartDay: startDay,
    abstractionPeriodStartMonth: startMonth,
    abstractionPeriodEndDay: endDay,
    abstractionPeriodEndMonth: endMonth
  } = relevantLicenceMonitoringStation

  return `${startDay}-${startMonth}-${endDay}-${endMonth}`
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

function _sortByAbstractionPeriod(firstItem, secondItem) {
  const [firstStartDay, firstStartMonth, firstEndDay, firstEndMonth] = firstItem.value.split('-').map(Number)
  const [secondStartDay, secondStartMonth, secondEndDay, secondEndMonth] = secondItem.value.split('-').map(Number)

  // `value` is day-first, so we deliberately compare month before day to get chronological ordering
  return (
    firstStartMonth - secondStartMonth ||
    firstStartDay - secondStartDay ||
    firstEndMonth - secondEndMonth ||
    firstEndDay - secondEndDay
  )
}
