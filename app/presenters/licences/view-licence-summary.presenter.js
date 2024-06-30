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
  const monitoringStations = _generateMonitoringStation(licenceGaugingStations)
  const abstractionData = _abstractionWrapper(licenceVersionPurposes, purposes, permitLicence)

  return {
    ...abstractionData,
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

function _abstractionWrapper (licenceVersionPurposes, purposes, permitLicence) {
  const abstractionPeriods = _generateAbstractionPeriods(licenceVersionPurposes)
  let abstractionPeriodsAndPurposesLinkText = null

  if (abstractionPeriods) {
    const abstractionPeriodsLabel = abstractionPeriods.uniqueAbstractionPeriods.length > 1 ? 'periods' : 'period'
    const purposesLabel = purposes.data.length > 1 ? 'purposes' : 'purpose'

    abstractionPeriodsAndPurposesLinkText = `View details of your ${purposesLabel}, ${abstractionPeriodsLabel} and amounts`
  }

  const abstractionDetails = _parseAbstractionsAndSourceOfSupply(permitLicence)
  const abstractionConditions = _abstractionConditions(licenceVersionPurposes)

  return {
    abstractionConditions,
    abstractionPeriods,
    abstractionPeriodsAndPurposesLinkText,
    abstractionPointLinkText: abstractionDetails.pointLinkText,
    abstractionPoints: abstractionDetails.points,
    abstractionPointsCaption: abstractionDetails.pointsCaption,
    abstractionQuantities: abstractionDetails.quantities,
    sourceOfSupply: abstractionDetails.sourceOfSupply
  }
}

function _abstractionAmountDetails (purpose) {
  const abstractionAmountDetails = []
  const { ANNUAL_QTY, DAILY_QTY, HOURLY_QTY, INST_QTY } = purpose

  if (ANNUAL_QTY !== 'null') {
    abstractionAmountDetails.push(`${parseFloat(ANNUAL_QTY).toFixed(2)} cubic metres per year`)
  }

  if (DAILY_QTY !== 'null') {
    abstractionAmountDetails.push(`${parseFloat(DAILY_QTY).toFixed(2)} cubic metres per day`)
  }

  if (HOURLY_QTY !== 'null') {
    abstractionAmountDetails.push(`${parseFloat(HOURLY_QTY).toFixed(2)} cubic metres per hour`)
  }

  if (INST_QTY !== 'null') {
    abstractionAmountDetails.push(`${parseFloat(INST_QTY).toFixed(2)} litres per second`)
  }

  return abstractionAmountDetails
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

function _generateMonitoringStation (licenceGaugingStations) {
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
  let abstractionQuantities

  permitLicence.purposes.forEach((purpose) => {
    purpose.purposePoints.forEach((point) => {
      const pointDetail = point.point_detail

      if (pointDetail) {
        abstractionPoints.push(generateAbstractionPointDetail(pointDetail))
      }
    })
    abstractionQuantities = _setAbstractionAmountDetails(abstractionQuantities, purpose)
  })

  const uniqueAbstractionPoints = [...new Set(abstractionPoints)]

  const abstractionLinkDefaultText = 'View details of the abstraction point'
  const pointLinkText = uniqueAbstractionPoints.length > 1 ? abstractionLinkDefaultText + 's' : abstractionLinkDefaultText

  const pointsCaption = uniqueAbstractionPoints.length > 1 ? 'Points of abstraction' : 'Point of abstraction'

  return {
    points: uniqueAbstractionPoints.length === 0 ? null : uniqueAbstractionPoints,
    pointsCaption,
    pointLinkText,
    quantities: abstractionQuantities && abstractionQuantities.length === 1
      ? _abstractionAmountDetails(abstractionQuantities[0])
      : null,
    sourceOfSupply: permitLicence.purposes[0].purposePoints[0]?.point_source?.NAME ?? null
  }
}

function _setAbstractionAmountDetails (abstractionAmountSet, purpose) {
  const { ANNUAL_QTY, DAILY_QTY, HOURLY_QTY, INST_QTY } = purpose
  const purposeAbstractionQuantities = {
    ANNUAL_QTY, DAILY_QTY, HOURLY_QTY, INST_QTY
  }

  if (!abstractionAmountSet &&
    (purposeAbstractionQuantities.DAILY_QTY !== 'null' ||
      purposeAbstractionQuantities.ANNUAL_QTY !== 'null' ||
      purposeAbstractionQuantities.HOURLY_QTY !== 'null' ||
      purposeAbstractionQuantities.INST_QTY !== 'null')) {
    return [purposeAbstractionQuantities]
  }

  if (abstractionAmountSet &&
    (abstractionAmountSet[0].ANNUAL_QTY !== purposeAbstractionQuantities.ANNUAL_QTY ||
      abstractionAmountSet[0].DAILY_QTY !== purposeAbstractionQuantities.DAILY_QTY ||
      abstractionAmountSet[0].HOURLY_QTY !== purposeAbstractionQuantities.HOURLY_QTY ||
      abstractionAmountSet[0].INST_QTY !== purposeAbstractionQuantities.INST_QTY)) {
    return abstractionAmountSet.push(purposeAbstractionQuantities)
  }

  return abstractionAmountSet
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
