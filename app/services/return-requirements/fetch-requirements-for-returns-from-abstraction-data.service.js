'use strict'

/**
 * Fetches return requirements based on abstraction data needed for `/return-requirements/{sessionId}/check` page
 * @module FetchReturnRequirementsBasedOnAbstractionDataService
 */

const FectchLicenceAgreementsService = require('./fetch-licence-agreements.service.js')
const FetchLicenceSummaryService = require('../licences/fetch-licence-summary.service.js')
const { generateAbstractionPointDetail } = require('../../lib/general.lib.js')

/**
 * Fetches return requirements based on abstraction data needed for `/return-requirements/{sessionId}/check` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} The abstraction data for the matching licenceId
 */
async function go (licenceId) {
  const data = await _fetchAbstractionData(licenceId)

  return data
}

async function _fetchAbstractionData (licenceId) {
  const licenceData = await FetchLicenceSummaryService.go(licenceId)
  const licenceAgreements = await FectchLicenceAgreementsService.go(licenceData.licenceRef)
  const returnRequirements = []

  licenceData.licenceVersions[0].licenceVersionPurposes.forEach((licenceVersionPurpose) => {
    const purpose = licenceData.licenceVersions[0].purposes.find((purpose) => {
      return purpose.id === licenceVersionPurpose.purposeId
    })

    const [, id] = licenceVersionPurpose.externalId.split(':')
    const permitPurpose = licenceData.permitLicence.purposes.find((purpose) => {
      return purpose.ID === id
    })
    const returnsCycle = _calculateReturnsCycle(licenceVersionPurpose)

    const abstractionPoint = generateAbstractionPointDetail(permitPurpose.purposePoints[0].point_detail)
    const siteDescription = permitPurpose.purposePoints[0].point_detail.LOCAL_NAME

    returnRequirements.push({
      abstractionPeriodStartDay: licenceVersionPurpose.abstractionPeriodStartDay,
      abstractionPeriodStartMonth: licenceVersionPurpose.abstractionPeriodStartMonth,
      abstractionPeriodEndDay: licenceVersionPurpose.abstractionPeriodEndDay,
      abstractionPeriodEndMonth: licenceVersionPurpose.abstractionPeriodEndMonth,
      abstractionPoint,
      isSummer: returnsCycle,
      purposeDescription: purpose.description,
      returnsFrequency: _calculateCollectionFrequency(licenceData, licenceVersionPurpose, licenceAgreements),
      reportingFrequency: _calculateReportingCycle(licenceData, licenceVersionPurpose),
      siteDescription
    })
  })

  return returnRequirements
}

function _calculateCollectionFrequency (licenceData, licenceVersionPurpose, licenceAgreements) {
  if (licenceData.waterUndertaker || licenceAgreements.length > 0) {
    return 'daily'
  }

  if (licenceVersionPurpose.dailyQuantity < 100) {
    return 'none'
  } else if (licenceVersionPurpose.dailyQuantity <= 2500) {
    return 'monthly'
  } else {
    return 'weekly'
  }
}

function _calculateReturnsCycle (purpose) {
  const purposeStartDate = new Date(1970, purpose.abstractionPeriodStartMonth - 1, purpose.abstractionPeriodStartDay)
  const purposeEndDate = new Date(1970, purpose.abstractionPeriodEndMonth - 1, purpose.abstractionPeriodEndDay)

  const summerStartDate = new Date(1970, 3, 1)
  const summerEndDate = new Date(1970, 9, 31)

  if (purposeStartDate >= summerStartDate && purposeEndDate <= summerEndDate) {
    return true
  }

  return false
}

function _calculateReportingCycle (licenceData, licenceVersionPurpose) {
  if (licenceData.waterUndertaker) {
    return 'daily'
  }

  if (licenceVersionPurpose.dailyQuantity <= 2500) {
    return 'monthly'
  } else {
    return 'weekly'
  }
}

module.exports = {
  go
}
