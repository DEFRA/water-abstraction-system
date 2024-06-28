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

  const purposes = _generatePurposes(licenceVersionPurposes)
  const monitoringStations = _generateMonitoringStations(licenceGaugingStations)
  const abstractionData = _abstractionWrapper(licenceVersionPurposes, permitLicence)
  const abstractionPeriods = _generateAbstractionPeriods(licenceVersionPurposes)

  return {
    ...abstractionData,
    abstractionAmounts: _abstractionAmounts(licenceVersionPurposes),
    abstractionPeriods,
    abstractionPeriodsAndPurposesLinkText: _abstractionPeriodsAndPurposesLinkText(abstractionPeriods, purposes),
    activeTab: 'summary',
    documentId: licenceDocumentHeader.id,
    endDate: _endDate(expiredDate),
    id,
    licenceHolder: _generateLicenceHolder(licence),
    monitoringStations,
    purposes,
    region: region.displayName,
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
    details.push(`${parseFloat(dailyQuantity).toFixed(2)} cubic metres per year`)
  }

  if (hourlyQuantity) {
    details.push(`${parseFloat(hourlyQuantity).toFixed(2)} cubic metres per year`)
  }

  if (instantQuantity) {
    details.push(`${parseFloat(instantQuantity).toFixed(2)} cubic metres per year`)
  }

  return details
}

function _abstractionWrapper (licenceVersionPurposes, permitLicence) {
  const abstractionDetails = _parseAbstractionsAndSourceOfSupply(permitLicence)
  const abstractionConditions = _abstractionConditions(licenceVersionPurposes)

  return {
    abstractionConditions,
    abstractionPointLinkText: abstractionDetails.pointLinkText,
    abstractionPoints: abstractionDetails.points,
    abstractionPointsCaption: abstractionDetails.pointsCaption,
    sourceOfSupply: abstractionDetails.sourceOfSupply
  }
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

function _abstractionPeriodsAndPurposesLinkText (abstractionPeriods, purposes) {
  let abstractionPeriodsAndPurposesLinkText = null

  if (abstractionPeriods) {
    const abstractionPeriodsLabel = abstractionPeriods.uniqueAbstractionPeriods.length > 1 ? 'periods' : 'period'
    const purposesLabel = purposes.data.length > 1 ? 'purposes' : 'purpose'
    abstractionPeriodsAndPurposesLinkText = `View details of your ${purposesLabel}, ${abstractionPeriodsLabel} and amounts`
  }

  return abstractionPeriodsAndPurposesLinkText
}

function _endDate (expiredDate) {
  if (!expiredDate || expiredDate < Date.now()) {
    return null
  }

  return formatLongDate(expiredDate)
}

function _generateAbstractionPeriods (licenceVersionPurposes) {
  if (!licenceVersionPurposes) {
    return null
  }

  const formattedAbstractionPeriods = licenceVersionPurposes.map((purpose) => {
    const startDate = formatAbstractionDate(purpose.abstractionPeriodStartDay, purpose.abstractionPeriodStartMonth)
    const endDate = formatAbstractionDate(purpose.abstractionPeriodEndDay, purpose.abstractionPeriodEndMonth)

    return `${startDate} to ${endDate}`
  })

  const uniqueAbstractionPeriods = [...new Set(formattedAbstractionPeriods)]

  return {
    caption: uniqueAbstractionPeriods.length > 1 ? 'Periods of abstraction' : 'Period of abstraction',
    uniqueAbstractionPeriods
  }
}

function _generateLicenceHolder (licence) {
  const licenceHolder = licence.$licenceHolder()

  if (!licenceHolder) {
    return 'Unregistered licence'
  }

  return licenceHolder
}

function _generateMonitoringStations (licenceGaugingStations) {
  return licenceGaugingStations.map((licenceGaugingStation) => {
    return licenceGaugingStation.gaugingStation
  })
}

function _generatePurposes (licenceVersionPurposes) {
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

function _parseAbstractionsAndSourceOfSupply (permitLicence) {
  if (!permitLicence ||
    !permitLicence.purposes ||
    permitLicence.purposes.length === 0 ||
    permitLicence.purposes[0]?.purposePoints === undefined ||
    permitLicence.purposes[0]?.purposePoints.length === 0
  ) {
    return {
      points: null,
      pointsCaption: null,
      pointLinkText: null,
      quantities: null,
      quantityCaption: null,
      sourceOfSupply: null
    }
  }

  const abstractionPoints = []

  permitLicence.purposes.forEach((purpose) => {
    purpose.purposePoints.forEach((point) => {
      const pointDetail = point.point_detail

      if (pointDetail) {
        abstractionPoints.push(generateAbstractionPointDetail(pointDetail))
      }
    })
  })

  const uniqueAbstractionPoints = [...new Set(abstractionPoints)]

  const abstractionLinkDefaultText = 'View details of the abstraction point'
  const pointLinkText = uniqueAbstractionPoints.length > 1 ? abstractionLinkDefaultText + 's' : abstractionLinkDefaultText

  const pointsCaption = uniqueAbstractionPoints.length > 1 ? 'Points of abstraction' : 'Point of abstraction'

  return {
    points: uniqueAbstractionPoints.length === 0 ? null : uniqueAbstractionPoints,
    pointsCaption,
    pointLinkText,
    sourceOfSupply: permitLicence.purposes[0].purposePoints[0]?.point_source?.NAME ?? null
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
