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

  return {
    id,
    abstractionPeriods,
    abstractionPeriodsAndPurposesLinkText,
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

module.exports = {
  go
}
