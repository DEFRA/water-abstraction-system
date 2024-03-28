'use strict'

/**
 * Formats data for the `/licences/{id}` page's summary tab
 * @module ViewLicencePresenter
 */

const { formatAbstractionDate } = require('../base.presenter.js')
const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/licences/{id}` page's summary tab
 *
 * @param {module:LicenceModel} licence - The licence where the data will be extracted for from
 *
 * @returns {Object} The data formatted for the view template
 */
function go (licence, licenceAbstractionConditions) {
  const {
    ends,
    expiredDate,
    id,
    licenceDocumentHeader,
    licenceGaugingStations,
    licenceHolder,
    licenceName,
    licenceRef,
    licenceVersions,
    permitLicence,
    region,
    registeredTo,
    startDate
  } = licence

  const abstractionPeriods = _generateAbstractionPeriods(licenceVersions)
  const purposes = _generatePurposes(licenceVersions)
  let abstractionPeriodsAndPurposesLinkText = null

  if (abstractionPeriods && purposes) {
    const abstractionPeriodsLabel = abstractionPeriods.uniqueAbstractionPeriods.length > 1 ? 'periods' : 'period'
    const purposesLabel = purposes.data.length > 1 ? 'purposes' : 'purpose'
    abstractionPeriodsAndPurposesLinkText = `View details of your ${purposesLabel}, ${abstractionPeriodsLabel} and amounts`
  }

  const abstractionDetails = _parseAbstractionsAndSourceOfSupply(permitLicence)
  const monitoringStations = _generateMonitoringStation(licenceGaugingStations)

  const abstractionConditionDetails = _abstractionConditionDetails(licenceAbstractionConditions)

  return {
    id,
    abstractionConditionDetails,
    abstractionPeriods,
    abstractionPeriodsAndPurposesLinkText,
    abstractionPoints: abstractionDetails.points,
    abstractionPointsCaption: abstractionDetails.pointsCaption,
    abstractionPointLinkText: abstractionDetails.pointLinkText,
    abstractionQuantities: abstractionDetails.quantities,
    documentId: licenceDocumentHeader.id,
    endDate: _endDate(expiredDate),
    licenceHolder: _generateLicenceHolder(licenceHolder),
    licenceName,
    licenceRef,
    monitoringStations,
    pageTitle: `Licence ${licenceRef}`,
    purposes,
    region: region.displayName,
    registeredTo,
    sourceOfSupply: abstractionDetails.sourceOfSupply,
    startDate: formatLongDate(startDate),
    warning: _generateWarningMessage(ends)
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

function _generateAbstractionContent (pointDetail) {
  let abstractionPoint = null

  if (pointDetail.NGR4_SHEET && pointDetail.NGR4_NORTH !== 'null') {
    const point1 = `${pointDetail.NGR1_SHEET} ${pointDetail.NGR1_EAST} ${pointDetail.NGR1_NORTH}`
    const point2 = `${pointDetail.NGR2_SHEET} ${pointDetail.NGR2_EAST} ${pointDetail.NGR2_NORTH}`
    const point3 = `${pointDetail.NGR3_SHEET} ${pointDetail.NGR3_EAST} ${pointDetail.NGR3_NORTH}`
    const point4 = `${pointDetail.NGR4_SHEET} ${pointDetail.NGR4_EAST} ${pointDetail.NGR4_NORTH}`

    abstractionPoint = `Within the area formed by the straight lines running between National Grid References ${point1} ${point2} ${point3} and ${point4}`
  } else if (pointDetail.NGR2_SHEET && pointDetail.NGR2_NORTH !== 'null') {
    const point1 = `${pointDetail.NGR1_SHEET} ${pointDetail.NGR1_EAST} ${pointDetail.NGR1_NORTH}`
    const point2 = `${pointDetail.NGR2_SHEET} ${pointDetail.NGR2_EAST} ${pointDetail.NGR2_NORTH}`

    abstractionPoint = `Between National Grid References ${point1} and ${point2}`
  } else {
    const point1 = `${pointDetail.NGR1_SHEET} ${pointDetail.NGR1_EAST} ${pointDetail.NGR1_NORTH}`

    abstractionPoint = `At National Grid Reference ${point1}`
  }

  abstractionPoint += pointDetail.LOCAL_NAME !== undefined ? ` (${pointDetail.LOCAL_NAME})` : ''

  return abstractionPoint
}

function _generateAbstractionPeriods (licenceVersions) {
  if (!licenceVersions ||
    licenceVersions.length === 0 ||
    licenceVersions[0]?.licenceVersionPurposes === undefined ||
    licenceVersions[0]?.licenceVersionPurposes?.length === 0
  ) {
    return null
  }

  const formattedAbstactionPeriods = licenceVersions[0].licenceVersionPurposes.map((purpose) => {
    const startDate = formatAbstractionDate(purpose.abstractionPeriodStartDay, purpose.abstractionPeriodStartMonth)
    const endDate = formatAbstractionDate(purpose.abstractionPeriodEndDay, purpose.abstractionPeriodEndMonth)
    return `${startDate} to ${endDate}`
  })

  const uniqueAbstractionPeriods = [...new Set(formattedAbstactionPeriods)]

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

function _generateWarningMessage (ends) {
  if (!ends) {
    return null
  }

  const { date, reason } = ends
  const today = new Date()

  if (date > today) {
    return null
  }

  if (reason === 'revoked') {
    return `This licence was revoked on ${formatLongDate(date)}`
  }

  if (reason === 'lapsed') {
    return `This licence lapsed on ${formatLongDate(date)}`
  }

  return `This licence expired on ${formatLongDate(date)}`
}

function _parseAbstractionsAndSourceOfSupply (permitLicence) {
  if (!permitLicence ||
    permitLicence?.purposes === undefined ||
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
        abstractionPoints.push(_generateAbstractionContent(pointDetail))
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
    (abstractionAmountSet.ANNUAL_QTY !== purposeAbstractionQuantities.ANNUAL_QTY ||
    abstractionAmountSet.DAILY_QTY !== purposeAbstractionQuantities.DAILY_QTY ||
    abstractionAmountSet.HOURLY_QTY !== purposeAbstractionQuantities.HOURLY_QTY ||
    abstractionAmountSet.INST_QTY !== purposeAbstractionQuantities.INST_QTY)) {
    return abstractionAmountSet.push(purposeAbstractionQuantities)
  }

  return abstractionAmountSet
}

module.exports = {
  go
}
