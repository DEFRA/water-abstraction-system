'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 * @module CheckLicenceMatchesPresenter
 */

const { formatLongDate, sentenceCase, formatAbstractionPeriod } = require('../../../base.presenter.js')

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @param session
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { licenceMonitoringStations } = session

  return {
    backLink: `/system/notices/setup/${session.id}/abstraction-alerts/alert-thresholds`,
    caption: session.monitoringStationName,
    pageTitle: 'Check the licence matches for the selected thresholds',
    restrictions: _restrictions(licenceMonitoringStations),
    restrictionHeading: _restrictionHeading(licenceMonitoringStations)
  }
}

function _alert(status, statusUpdatedAt) {
  if (!statusUpdatedAt) {
    return null
  }

  return sentenceCase(status)
}

function _restriction(restrictionType) {
  if (restrictionType === 'stop_or_reduce') {
    return 'Stop or reduce'
  }

  return sentenceCase(restrictionType)
}

function _restrictionCount(licenceId, licenceMonitoringStations) {
  const count = licenceMonitoringStations.filter((licenceMonitoringStation) => {
    return licenceMonitoringStation.licenceId === licenceId
  })

  return count.length
}

function _restrictionHeading(licenceMonitoringStations) {
  const containsFlow = licenceMonitoringStations.some((licenceMonitoringStation) => {
    return licenceMonitoringStation.measureType === 'flow'
  })

  const containsLevel = licenceMonitoringStations.some((licenceMonitoringStation) => {
    return licenceMonitoringStation.measureType === 'level'
  })

  if (containsFlow && containsLevel) {
    return 'Flow and level restriction type and threshold'
  }

  if (containsFlow) {
    return 'Flow restriction type and threshold'
  }

  return 'Level restriction type and threshold'
}

function _restrictions(licenceMonitoringStations) {
  return licenceMonitoringStations.map((licenceMonitoringStation) => {
    const {
      abstractionPeriodEndDay,
      abstractionPeriodEndMonth,
      abstractionPeriodStartDay,
      abstractionPeriodStartMonth,
      licenceId,
      licenceRef,
      restrictionType,
      status,
      statusUpdatedAt,
      thresholdUnit,
      thresholdValue
    } = licenceMonitoringStation

    return {
      abstractionPeriod: formatAbstractionPeriod(
        abstractionPeriodStartDay,
        abstractionPeriodStartMonth,
        abstractionPeriodEndDay,
        abstractionPeriodEndMonth
      ),
      alert: _alert(status, statusUpdatedAt),
      alertDate: statusUpdatedAt ? formatLongDate(new Date(statusUpdatedAt)) : null,
      licenceId,
      licenceRef,
      restriction: _restriction(restrictionType),
      restrictionCount: _restrictionCount(licenceId, licenceMonitoringStations),
      threshold: `${thresholdValue} ${thresholdUnit}`,
      action: {
        link: `/system`,
        name: 'Remove'
      }
    }
  })
}

module.exports = {
  go
}
