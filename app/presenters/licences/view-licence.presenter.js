'use strict'

/**
 * Formats data for the view `/licences/{id}/` page
 * @module ViewLicencePresenter
 */

const { formatAbstractionDate } = require('../base.presenter.js')
const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/licences/{id}/` page
 *
 * @param {module:LicenceModel} licence - The licence where the data will be extracted for from
 *
 * @returns {Object} The data formatted for the view template
 */
function go (licence) {
  const {
    ends,
    expiredDate,
    id,
    licenceDocumentHeader,
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

  const pointDetails = _parseAbstractionsAndSourceOfSupply(permitLicence)

  console.log(pointDetails)

  return {
    id,
    abstractionPeriods,
    abstractionPeriodsAndPurposesLinkText,
    abstractionPoints: pointDetails.abstractionPoints,
    abstractionPointsCaption: pointDetails.abstractionPointsCaption,
    documentId: licenceDocumentHeader.id,
    endDate: _endDate(expiredDate),
    licenceHolder: _generateLicenceHolder(licenceHolder),
    licenceName,
    licenceRef,
    pageTitle: `Licence ${licenceRef}`,
    purposes,
    region: region.displayName,
    registeredTo,
    startDate: formatLongDate(startDate),
    sourceOfSupply: pointDetails.sourceOfSupply,
    warning: _generateWarningMessage(ends)
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
    return null
  }

  const abstractionPoints = []

  permitLicence.purposes[0].purposePoints.forEach((point) => {
    const pointDetail = point.point_detail
    let abstractionPoint = null

    if (pointDetail.NGR4_SHEET) {
      const point1 = `${pointDetail.NGR1_SHEET} ${pointDetail.NGR1_EAST} ${pointDetail.NGR1_NORTH}`
      const point2 = `${pointDetail.NGR2_SHEET} ${pointDetail.NGR2_EAST} ${pointDetail.NGR2_NORTH}`
      const point3 = `${pointDetail.NGR3_SHEET} ${pointDetail.NGR3_EAST} ${pointDetail.NGR3_NORTH}`
      const point4 = `${pointDetail.NGR4_SHEET} ${pointDetail.NGR4_EAST} ${pointDetail.NGR4_NORTH}`

      abstractionPoint = `Within the area formed by the straight lines running between National Grid References ${point1} ${point2} ${point3} and ${point4} `
    }

    if (pointDetail.NGR2_SHEET) {
      const point1 = `${pointDetail.NGR1_SHEET} ${pointDetail.NGR1_EAST} ${pointDetail.NGR1_NORTH}`
      const point2 = `${pointDetail.NGR2_SHEET} ${pointDetail.NGR2_EAST} ${pointDetail.NGR2_NORTH}`

      abstractionPoint = `Between National Grid References ${point1} and ${point2} `
    }

    if (pointDetail.NGR1_SHEET) {
      const point1 = `${pointDetail.NGR1_SHEET} ${pointDetail.NGR1_EAST} ${pointDetail.NGR1_NORTH}`

      abstractionPoint = `At National Grid Reference ${point1} `
    }

    abstractionPoint += pointDetail?.LOCAL_NAME ?? ''

    abstractionPoints.push(abstractionPoint)
  })

  return {
    abstractionPoints,
    abstractionPointsCaption: abstractionPoints.length > 1 ? 'Points of abstraction' : 'Point of abstraction',
    sourceOfSupply: permitLicence.purposes[0].purposePoints[0]?.point_source?.NAME ?? null

  }
}

module.exports = {
  go
}
