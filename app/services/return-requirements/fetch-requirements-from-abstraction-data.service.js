'use strict'

/**
 * Fetches return requirements based on abstraction data needed for `/return-requirements/{sessionId}/check` page
 * @module FetchReturnRequirementsBasedOnAbstractionDataService
 */

const FectchLicenceAgreementsService = require('./fetch-licence-agreements.service.js')
const FetchLicenceSummaryService = require('../licences/fetch-licence-summary.service.js')
const { generateAbstractionPointDetail } = require('../../lib/general.lib.js')

const minimumDailyQuantityThreshold = 100
const upperDailyQuantityThreshold = 2500

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
    const licencePurpose = licenceData.licenceVersions[0].purposes.find((purpose) => {
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
      purposeDescription: licencePurpose.description,
      returnsFrequency: _calculateCollectionFrequency(licenceData, licenceVersionPurpose, licenceAgreements),
      reportingFrequency: _calculateReportingFrequency(licenceData, licenceVersionPurpose),
      siteDescription
    })
  })

  return returnRequirements
}

function _calculateCollectionFrequency (licenceData, licenceVersionPurpose, licenceAgreements) {
  if (licenceData.waterUndertaker || licenceAgreements.length > 0) {
    return 'daily'
  }

  if (licenceVersionPurpose.dailyQuantity < minimumDailyQuantityThreshold) {
    return 'none'
  } else if (licenceVersionPurpose.dailyQuantity <= upperDailyQuantityThreshold) {
    return 'monthly'
  }

  return 'weekly'
}

function _calculateReturnsCycle (purpose) {
  const epocStartDate = 1970
  const purposeStartDate = new Date(epocStartDate, purpose.abstractionPeriodStartMonth - 1, purpose.abstractionPeriodStartDay)
  const purposeEndDate = new Date(epocStartDate, purpose.abstractionPeriodEndMonth - 1, purpose.abstractionPeriodEndDay)

  const summerStartDate = new Date('1970-04-01')
  const summerEndDate = new Date('1970-10-31')

  return purposeStartDate >= summerStartDate && purposeEndDate <= summerEndDate
}

function _calculateReportingFrequency (licenceData, licenceVersionPurpose) {
  if (licenceData.waterUndertaker) {
    return 'daily'
  }

  if (licenceVersionPurpose.dailyQuantity <= upperDailyQuantityThreshold) {
    return 'monthly'
  }

  return 'weekly'
}

module.exports = {
  go
}
