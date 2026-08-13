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
  let absPeriodFilter = filters.absPeriod

  const relevantLicenceMonitoringStations = _relevantLicenceMonitoringStations(session)
  const filteredLicenceMonitoringStations = _filteredLicenceMonitoringStations(
    absPeriodFilter,
    relevantLicenceMonitoringStations
  )

  if (filteredLicenceMonitoringStations.length === 0) {
    absPeriodFilter = null
  }

  const licenceMonitoringStationsToDisplay =
    filteredLicenceMonitoringStations.length > 0 ? filteredLicenceMonitoringStations : relevantLicenceMonitoringStations

  return {
    actionHeaderLink: _actionHeaderLink(absPeriodFilter, session.id, filteredLicenceMonitoringStations),
    backLink: { href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-thresholds`, text: 'Back' },
    cancelLink: `/system/notices/setup/${session.id}/abstraction-alerts/cancel`,
    clearFilter: filteredLicenceMonitoringStations.length === 0,
    items: _items(absPeriodFilter, relevantLicenceMonitoringStations),
    pageTitle: 'Check the licence matches for the selected thresholds',
    pageTitleCaption: session.monitoringStationName,
    restrictions: _restrictions(absPeriodFilter, licenceMonitoringStationsToDisplay, session.id),
    restrictionHeading: determineRestrictionHeading(licenceMonitoringStationsToDisplay)
  }
}

function _action(sessionId, licenceMonitoringStation) {
  return {
    link: `/system/notices/setup/${sessionId}/abstraction-alerts/remove-threshold/${licenceMonitoringStation.id}`,
    text: 'Remove'
  }
}

function _actionHeaderLink(absPeriodFilter, sessionId, licenceMonitoringStations) {
  if (absPeriodFilter) {
    return {
      link: `/system/notices/setup/${sessionId}/abstraction-alerts/remove-filtered-thresholds/${absPeriodFilter}`,
      text: `Remove ${licenceMonitoringStations.length} alerts`
    }
  }

  return null
}

function _filteredLicenceMonitoringStations(absPeriodFilter, licenceMonitoringStations) {
  if (absPeriodFilter) {
    return licenceMonitoringStations.filter((licenceMonitoringStation) => {
      const periodValue = _periodValue(licenceMonitoringStation)

      return absPeriodFilter === periodValue
    })
  }

  return licenceMonitoringStations
}

function _items(absPeriodFilter, licenceMonitoringStations) {
  const items = []
  const seenIds = new Set()

  for (const licenceMonitoringStation of licenceMonitoringStations) {
    const periodValue = _periodValue(licenceMonitoringStation)

    if (seenIds.has(periodValue)) {
      continue
    }

    seenIds.add(periodValue)

    items.push({
      id: periodValue,
      checked: periodValue === absPeriodFilter,
      text: formatAbstractionPeriod(
        licenceMonitoringStation.abstractionPeriodStartDay,
        licenceMonitoringStation.abstractionPeriodStartMonth,
        licenceMonitoringStation.abstractionPeriodEndDay,
        licenceMonitoringStation.abstractionPeriodEndMonth
      ),
      value: periodValue
    })
  }

  return items
}

function _periodValue(licenceMonitoringStation) {
  const { abstractionPeriodStartDay, abstractionPeriodStartMonth, abstractionPeriodEndDay, abstractionPeriodEndMonth } =
    licenceMonitoringStation

  return `${abstractionPeriodStartDay}-${abstractionPeriodStartMonth}-${abstractionPeriodEndDay}-${abstractionPeriodEndMonth}`
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

function _restrictions(absPeriodFilter, relevantLicenceMonitoringStations, sessionId) {
  // We want to display the "Action" link/header if there is only one record but the filter has been applied
  const multipleRestrictions = relevantLicenceMonitoringStations.length > 1 || !!absPeriodFilter

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
