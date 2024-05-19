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
 * @param {module:LicenceModel} licence - The licence where the data will be extracted for from
 *
 * @returns {Object} The data formatted for the view template
 */
function go (licence, licenceAbstractionConditions) {
  const {
    expiredDate,
    id,
    licenceDocumentHeader,
    licenceGaugingStations,
    licenceHolder,
    licenceVersions,
    permitLicence,
    region,
    startDate
  } = licence

  const purposes = _generatePurposes(licenceVersions)
  const monitoringStations = _generateMonitoringStation(licenceGaugingStations)
  const abstractionData = _abstractionWrapper(licenceAbstractionConditions, licenceVersions, purposes, permitLicence)

  return {
    ...abstractionData,
    activeTab: 'summary',
    documentId: licenceDocumentHeader.id,
    endDate: _endDate(expiredDate),
    id,
    licenceHolder: _generateLicenceHolder(licenceHolder),
    monitoringStations,
    purposes,
    region: region.displayName,
    startDate: formatLongDate(startDate)
  }
}

function _abstractionWrapper (licenceAbstractionConditions, licenceVersions, purposes, permitLicence) {
  const abstractionPeriods = _generateAbstractionPeriods(licenceVersions)
  let abstractionPeriodsAndPurposesLinkText = null

  if (abstractionPeriods && purposes) {
    const abstractionPeriodsLabel = abstractionPeriods.uniqueAbstractionPeriods.length > 1 ? 'periods' : 'period'
    const purposesLabel = purposes.data.length > 1 ? 'purposes' : 'purpose'
    abstractionPeriodsAndPurposesLinkText = `View details of your ${purposesLabel}, ${abstractionPeriodsLabel} and amounts`
  }

  const abstractionDetails = _parseAbstractionsAndSourceOfSupply(permitLicence)
  const abstractionConditionDetails = _abstractionConditionDetails(licenceAbstractionConditions)

  return {
    abstractionConditionDetails,
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

function _abstractionConditionDetails (licenceAbstractionConditions) {
  const { conditions, numberOfConditions } = licenceAbstractionConditions

  return {
    conditions,
    numberOfConditions
  }
}

function _endDate (expiredDate) {
  if (!expiredDate || expiredDate < Date.now()) {
    return null
  }

  return formatLongDate(expiredDate)
}

function _generateAbstractionPeriods (licenceVersions) {
  if (!licenceVersions ||
    licenceVersions.length === 0 ||
    licenceVersions[0]?.licenceVersionPurposes === undefined ||
    licenceVersions[0]?.licenceVersionPurposes?.length === 0
  ) {
    return null
  }

  const formattedAbstractionPeriods = licenceVersions[0].licenceVersionPurposes.map((purpose) => {
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

function _generateLicenceHolder (licenceHolder) {
  if (!licenceHolder) {
    return 'Unregistered licence'
  }

  return licenceHolder
}

function _generateMonitoringStation (stations) {
  let monitoringStations = []
  if (stations && stations.length !== undefined) {
    const jsonArray = stations.map(JSON.stringify)
    monitoringStations = Array.from(new Set(jsonArray)).map(JSON.parse)
  }

  return monitoringStations
}

function _generatePurposes (licenceVersions) {
  if (!licenceVersions ||
    licenceVersions.length === 0 ||
    licenceVersions[0]?.purposes === undefined ||
    licenceVersions[0]?.purposes?.length === 0
  ) {
    return null
  }
  const allPurposeDescriptions = licenceVersions[0].purposes.map((item) => {
    return item.description
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

module.exports = {
  go
}
