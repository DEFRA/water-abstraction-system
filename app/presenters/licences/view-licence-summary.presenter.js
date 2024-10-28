'use strict'

/**
 * Formats data for the `/licences/{id}/summary` page's summary tab
 * @module ViewLicenceSummaryPresenter
 */

const { formatLongDate, formatAbstractionDate } = require('../base.presenter.js')

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

/**
 * Formats data for the `/licences/{id}/summary` page's summary tab
 *
 * @param {module:LicenceModel} licence - The licence the summary data will be extracted from
 *
 * @returns {object} The data formatted for the view template
 */
function go (licence) {
  const {
    expiredDate,
    id,
    licenceDocumentHeader,
    licenceMonitoringStations,
    region,
    startDate
  } = licence

  const licenceVersionPurposes = _licenceVersionPurposes(licence)
  const purposes = _purposes(licenceVersionPurposes)
  const abstractionPeriods = _abstractionPeriods(licenceVersionPurposes)
  const abstractionPoints = _abstractionPoints(licenceVersionPurposes)

  const enableLicencePointsView = FeatureFlagsConfig.enableLicencePointsView
  const enableMonitoringStationsView = FeatureFlagsConfig.enableMonitoringStationsView

  return {
    abstractionAmounts: _abstractionAmounts(licenceVersionPurposes),
    abstractionConditions: _abstractionConditions(licenceVersionPurposes),
    abstractionPeriods,
    abstractionPeriodsAndPurposesLinkText: _abstractionPeriodsAndPurposesLinkText(abstractionPeriods, purposes),
    abstractionPeriodsCaption: _abstractionPeriodsCaption(abstractionPeriods),
    abstractionPoints,
    abstractionPointsCaption: _abstractionPointsCaption(abstractionPoints),
    abstractionPointsLinkText: _abstractionPointsLinkText(abstractionPoints),
    activeTab: 'summary',
    documentId: licenceDocumentHeader.id,
    enableLicencePointsView,
    enableMonitoringStationsView,
    endDate: _endDate(expiredDate),
    licenceHolder: _licenceHolder(licence),
    licenceId: id,
    monitoringStations: _monitoringStations(licenceMonitoringStations),
    purposes,
    purposesCount: licenceVersionPurposes ? licenceVersionPurposes.length : 0,
    region: region.displayName,
    sourceOfSupply: _sourceOfSupply(licenceVersionPurposes),
    startDate: formatLongDate(startDate)
  }
}

function _abstractionAmounts (licenceVersionPurposes) {
  const details = []

  if (!licenceVersionPurposes || licenceVersionPurposes.length > 1) {
    return details
  }

  const { annualQuantity, dailyQuantity, hourlyQuantity, instantQuantity } = licenceVersionPurposes[0]

  if (annualQuantity) {
    details.push(`${parseFloat(annualQuantity).toFixed(2)} cubic metres per year`)
  }

  if (dailyQuantity) {
    details.push(`${parseFloat(dailyQuantity).toFixed(2)} cubic metres per day`)
  }

  if (hourlyQuantity) {
    details.push(`${parseFloat(hourlyQuantity).toFixed(2)} cubic metres per hour`)
  }

  if (instantQuantity) {
    details.push(`${parseFloat(instantQuantity).toFixed(2)} cubic metres per second`)
  }

  return details
}

function _abstractionConditions (licenceVersionPurposes) {
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

function _abstractionPeriods (licenceVersionPurposes) {
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

function _abstractionPeriodsAndPurposesLinkText (abstractionPeriods, purposes) {
  let abstractionPeriodsAndPurposesLinkText = null

  if (abstractionPeriods.length > 0) {
    const abstractionPeriodsLabel = abstractionPeriods.length > 1 ? 'periods' : 'period'
    const purposesLabel = purposes.data.length > 1 ? 'purposes' : 'purpose'

    abstractionPeriodsAndPurposesLinkText = `View details of your ${purposesLabel}, ${abstractionPeriodsLabel} and amounts`
  }

  return abstractionPeriodsAndPurposesLinkText
}

function _abstractionPeriodsCaption (abstractionPeriods) {
  return abstractionPeriods.length > 1 ? 'Periods of abstraction' : 'Period of abstraction'
}

function _abstractionPoints (licenceVersionPurposes) {
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

function _abstractionPointsCaption (abstractionPoints) {
  return abstractionPoints.length > 1 ? 'Points of abstraction' : 'Point of abstraction'
}

function _abstractionPointsLinkText (abstractionPoints) {
  return abstractionPoints.length > 1 ? 'View details of the abstraction points' : 'View details of the abstraction point'
}

function _endDate (expiredDate) {
  if (!expiredDate || expiredDate < Date.now()) {
    return null
  }

  return formatLongDate(expiredDate)
}

function _licenceHolder (licence) {
  const licenceHolder = licence.$licenceHolder()

  if (!licenceHolder) {
    return 'Unregistered licence'
  }

  return licenceHolder
}

function _licenceVersionPurposes (licence) {
  const currentVersion = licence.$currentVersion()

  if (!currentVersion || currentVersion?.licenceVersionPurposes.length === 0) {
    return null
  }

  return currentVersion.licenceVersionPurposes
}

function _monitoringStations (licenceMonitoringStations) {
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

function _purposes (licenceVersionPurposes) {
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

function _sourceOfSupply (licenceVersionPurposes) {
  if (!licenceVersionPurposes || licenceVersionPurposes[0].points.length === 0) {
    return null
  }

  return licenceVersionPurposes[0].points[0].source.description
}

module.exports = {
  go
}
