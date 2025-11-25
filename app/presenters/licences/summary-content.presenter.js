'use strict'

/**
 * Formats data for the `/licences/{id}/summary` page
 * @module SummaryContentPresenter
 */

const { formatLongDate, formatAbstractionDate } = require('../base.presenter.js')
const { formatAbstractionAmounts } = require('./base-licences.presenter.js')

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

/**
 * Formats data for the `/licences/{id}/summary` page
 *
 * @param {module:LicenceModel} licence - The licence the summary data will be extracted from
 *
 * @returns {object} The data formatted for the view template
 */
function go(licence) {
  const { expiredDate, id, licenceDocumentHeader, licenceMonitoringStations, region, startDate } = licence

  const licenceVersionPurposes = _licenceVersionPurposes(licence)
  const purposes = _purposes(licenceVersionPurposes)
  const abstractionPeriods = _abstractionPeriods(licenceVersionPurposes)
  const abstractionPoints = _abstractionPoints(licenceVersionPurposes)

  const enableMonitoringStationsView = FeatureFlagsConfig.enableMonitoringStationsView

  return {
    abstractionAmounts: _abstractionAmounts(licenceVersionPurposes),
    abstractionConditions: _abstractionConditions(licenceVersionPurposes),
    abstractionPeriods,
    abstractionPeriodsCaption: _abstractionPeriodsCaption(abstractionPeriods),
    abstractionPoints,
    abstractionPointsCaption: _abstractionPointsCaption(abstractionPoints),
    activeSecondaryNav: 'summary',
    documentId: licenceDocumentHeader.id,
    enableMonitoringStationsView,
    endDate: _endDate(expiredDate),
    licenceHolder: _licenceHolder(licence),
    licenceId: id,
    monitoringStations: _monitoringStations(licenceMonitoringStations),
    purposes,
    purposesCount: licenceVersionPurposes ? licenceVersionPurposes.length : 0,
    region: region.displayName,
    sourceOfSupply: _sourceOfSupply(licenceVersionPurposes),
    startDate: _startDay(licence)
  }
}

function _abstractionAmounts(licenceVersionPurposes) {
  if (!licenceVersionPurposes || licenceVersionPurposes.length > 1) {
    return []
  }

  return formatAbstractionAmounts(licenceVersionPurposes[0])
}

function _abstractionConditions(licenceVersionPurposes) {
  const allConditions = []

  if (!licenceVersionPurposes) {
    return allConditions
  }

  for (const licenceVersionPurpose of licenceVersionPurposes) {
    const { licenceVersionPurposeConditions } = licenceVersionPurpose

    for (const licenceVersionPurposeCondition of licenceVersionPurposeConditions) {
      const { displayTitle } = licenceVersionPurposeCondition.licenceVersionPurposeConditionType

      allConditions.push(displayTitle)
    }
  }

  const uniqueConditions = [...new Set(allConditions)]

  // Sort them alphabetically
  return uniqueConditions.sort()
}

function _abstractionPeriods(licenceVersionPurposes) {
  if (!licenceVersionPurposes) {
    return []
  }

  const abstractionPeriods = licenceVersionPurposes.map((purpose) => {
    const startDate = formatAbstractionDate(purpose.abstractionPeriodStartDay, purpose.abstractionPeriodStartMonth)
    const endDate = formatAbstractionDate(purpose.abstractionPeriodEndDay, purpose.abstractionPeriodEndMonth)

    return `${startDate} to ${endDate}`
  })

  const uniqueAbstractionPeriods = [...new Set(abstractionPeriods)]

  return uniqueAbstractionPeriods
}

function _abstractionPeriodsCaption(abstractionPeriods) {
  return abstractionPeriods.length > 1 ? 'Periods of abstraction' : 'Period of abstraction'
}

function _abstractionPoints(licenceVersionPurposes) {
  if (!licenceVersionPurposes) {
    return []
  }

  const abstractionPoints = []

  licenceVersionPurposes.forEach((licenceVersionPurpose) => {
    const { points } = licenceVersionPurpose
    const pointDescriptions = points.map((point) => {
      return point.$describe()
    })

    abstractionPoints.push(...pointDescriptions)
  })
  const uniqueAbstractionPoints = [...new Set(abstractionPoints)]

  return uniqueAbstractionPoints.sort()
}

function _abstractionPointsCaption(abstractionPoints) {
  return abstractionPoints.length > 1 ? 'Points of abstraction' : 'Point of abstraction'
}

function _endDate(expiredDate) {
  if (!expiredDate || expiredDate < Date.now()) {
    return null
  }

  return formatLongDate(expiredDate)
}

function _licenceHolder(licence) {
  const licenceHolder = licence.$licenceHolder()

  if (!licenceHolder) {
    return 'Unregistered licence'
  }

  return licenceHolder
}

function _licenceVersionPurposes(licence) {
  const currentVersion = licence.$currentVersion()

  if (!currentVersion || currentVersion?.licenceVersionPurposes.length === 0) {
    return null
  }

  return currentVersion.licenceVersionPurposes
}

function _monitoringStations(licenceMonitoringStations) {
  const monitoringStations = []

  for (const licenceMonitoringStation of licenceMonitoringStations) {
    const alreadySeen = monitoringStations.some((monitoringStation) => {
      return monitoringStation.id === licenceMonitoringStation.monitoringStation.id
    })

    if (alreadySeen) {
      continue
    }

    monitoringStations.push(licenceMonitoringStation.monitoringStation)
  }

  return monitoringStations
}

function _purposes(licenceVersionPurposes) {
  if (!licenceVersionPurposes) {
    return null
  }

  const allPurposeDescriptions = licenceVersionPurposes.map((licenceVersionPurpose) => {
    return licenceVersionPurpose.purpose.description
  })

  const uniquePurposes = [...new Set(allPurposeDescriptions)]

  return {
    caption: uniquePurposes.length === 1 ? 'Purpose' : 'Purposes',
    data: uniquePurposes
  }
}

function _sourceOfSupply(licenceVersionPurposes) {
  if (!licenceVersionPurposes || licenceVersionPurposes[0].points.length === 0) {
    return null
  }

  return licenceVersionPurposes[0].points[0].source.description
}

function _startDay(licence) {
  const currentVersion = licence.$currentVersion()

  return formatLongDate(currentVersion.startDate)
}

module.exports = {
  go
}
