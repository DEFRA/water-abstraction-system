'use strict'

const { formatLongDate, sentenceCase, formatAbstractionPeriod } = require('../base.presenter.js')

function _alert(status, statusUpdatedAt) {
  if (!statusUpdatedAt) {
    return null
  }

  return sentenceCase(status)
}

/**
 * Transforms a list of licence monitoring station records into abstraction restrictions.
 *
 * Each input object may include an `action` property with the following structure:
 * ```
 * action = {
 *   link: `/system/licence-monitoring-station/${licenceMonitoringStation.id}`,
 *   text: 'View'
 * }
 * ```
 *
 * This action is passed through to the resulting restriction object unchanged.
 *
 * @param {object[]} licenceMonitoringStations
 *
 * @returns {object[]}
 */
function restrictions(licenceMonitoringStations) {
  return licenceMonitoringStations.map((licenceMonitoringStation) => {
    const {
      abstractionPeriodEndDay,
      abstractionPeriodEndMonth,
      abstractionPeriodStartDay,
      abstractionPeriodStartMonth,
      action,
      licence,
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
      alertDate: statusUpdatedAt ? formatLongDate(statusUpdatedAt) : null,
      licenceId: licence.id,
      licenceRef: licence.licenceRef,
      restriction: _restriction(restrictionType),
      restrictionCount: _restrictionCount(licence.id, licenceMonitoringStations),
      threshold: `${thresholdValue} ${thresholdUnit}`,
      action
    }
  })
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

/**
 * Returns the heading for the "restrictions" column of the monitoring station page
 *
 * When we came to replace the legacy page we found that when a licence is tagged, the existing logic records the
 * measure type of the licence monitoring station record as 'flow' or 'level' based on the threshold unit selected.
 *
 * - flowUnits = Ml/d, m3/s, m3/d, l/s
 * - levelUnits = mAOD, mBOD, mASD, m, SLD
 *
 * But we don't show this on the page. The only clue was the heading "Flow and level restriction type and threshold". In
 * our initial implementation of the page we added this as a new column. But we quickly saw that whatever monitoring you
 * have selected, the linked records are always of one type.
 *
 * We suspect it's the monitoring station itself that determines how the available water is measured, and that when a
 * user tags a licence they should only be able to select the appropriate threshold unit. But instead users are managing
 * to select the appropriate threshold unit when tagging each licence. Go legacy!
 *
 * So, instead we removed the measure type column and opted to be a little bit cleverer with the column heading. Now,
 * instead of a fixed "Flow and level restriction type and threshold", we determine it based on the licence monitoring
 * station records. Go the new folks!
 *
 * @param {object[]} licenceMonitoringStations
 *
 * @returns {string} - the restriction header
 */
function restrictionHeading(licenceMonitoringStations) {
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

module.exports = {
  restrictions,
  restrictionHeading
}
