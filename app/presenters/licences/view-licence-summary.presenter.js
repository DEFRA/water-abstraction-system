'use strict'

/**
 * Formats data for the `/licences/{id}/summary` page's summary tab
 * @module ViewLicenceSummaryPresenter
 */

const { formatLongDate, formatAbstractionDate } = require('../base.presenter.js')
const { generateAbstractionPointDetail } = require('../../lib/general.lib.js')

/**
 * Formats data for the `/licences/{id}/summary` page's summary tab
 *
 * @param {module:LicenceModel} licence - The licence the summary data will be extracted from
 *
 * @returns {Object} The data formatted for the view template
 */
function go (licence) {
  const {
    expiredDate,
    id,
    licenceDocumentHeader,
    licenceGaugingStations,
    permitLicence,
    region,
    startDate
  } = licence

  const licenceVersionPurposes = _licenceVersionPurposes(licence)
  const points = _points(permitLicence)

  const purposes = _purposes(licenceVersionPurposes)
  const abstractionPeriods = _abstractionPeriods(licenceVersionPurposes)
  const abstractionPoints = _abstractionPoints(points)

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
    endDate: _endDate(expiredDate),
    licenceHolder: _licenceHolder(licence),
    licenceId: id,
    monitoringStations: _monitoringStations(licenceGaugingStations),
    purposes,
    region: region.displayName,
    sourceOfSupply: points[0]?.point_source?.NAME ?? null,
    startDate: formatLongDate(startDate)
  }
}

function _abstractionAmounts (licenceVersionPurposes) {
  const details = []

  if (!licenceVersionPurposes) {
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

function _abstractionPoints (points) {
  const abstractionPoints = []

  points.forEach((point) => {
    if (point?.point_detail) {
      abstractionPoints.push(generateAbstractionPointDetail(point.point_detail))
    }
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

function _monitoringStations (licenceGaugingStations) {
  return licenceGaugingStations.map((licenceGaugingStation) => {
    return licenceGaugingStation.gaugingStation
  })
}

function _points (permitLicence) {
  const points = []

  if (!permitLicence?.purposes?.[0]?.purposePoints) {
    return points
  }

  permitLicence.purposes.forEach((purpose) => {
    purpose.purposePoints.forEach((purposePoint) => {
      points.push(purposePoint)
    })
  })

  return points
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

function _licenceVersionPurposes (licence) {
  const currentVersion = licence.$currentVersion()

  if (!currentVersion || currentVersion?.licenceVersionPurposes.length === 0) {
    return null
  }

  return currentVersion.licenceVersionPurposes
}

module.exports = {
  go
}
