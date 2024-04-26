'use strict'

/**
 * Fetches return requirements based on abstraction data needed for `/return-requirements/{sessionId}/check-your-answers` page
 * @module FetchReturnRequirementsBasedOnAbstractionDataService
 */

const FetchLicenceAbstractionConditionsService = require('../licences/fetch-licence-abstraction-conditions.service.js')
const FetchLicenceService = require('../licences/fetch-licence.service.js')
const { formatAbstractionDate } = require('../../presenters/base.presenter.js')
const { generateAbstractionPointDetail } = require('../../lib/general.lib.js')
const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetches return requirements based on abstraction data needed for `/return-requirements/{sessionId}/check-your-answers` page
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
  const licenceData = await FetchLicenceService.go(licenceId)

  const currentLicenceVersionId = licenceData?.licenceVersions[0]?.id

  const licenceAbstractionConditions = await FetchLicenceAbstractionConditionsService.go(currentLicenceVersionId)
  const returnRequirements = []
  // console.log(licenceData)
  // console.log(licenceData.permitLicence.purposes[0])
  // console.log(licenceData.permitLicence.purposes[0].purposePoints[0].point_detail)
  // console.log(licenceData.licenceVersions[0].purposes)
  console.log(licenceData.licenceVersions[0].licenceVersionPurposes)
  // console.log(licenceAbstractionConditions)

  licenceData.licenceVersions[0].licenceVersionPurposes.forEach((licenceVersionPurpose) => {
    const purpose = licenceData.licenceVersions[0].purposes.find((purpose) => {
      return purpose.ID === purpose.purposeId
    })

    const [, id] = licenceVersionPurpose.externalId.split(':')
    const permitPurpose = licenceData.permitLicence.purposes.find((purpose) => {
      return purpose.ID === id
    })

    // console.log(purpose)
    // console.log(licenceVersionPurpose)

    const abstractionPeriod = _generateAbstractionPeriod(licenceVersionPurpose)
    const returnsCycle = _calculateReturnsCycle(licenceVersionPurpose)

    // need permit data - so need to be able to link purpose to specific permitLicence.purposes
    // point =  permitLicence.purposes[0].purposePoints[0].point_detail
    // const siteDescription = licenceData.permitLicence.purposes[0].purposePoints[0].point_detail.LOCAL_NAME

    const abstractionPoint = generateAbstractionPointDetail(permitPurpose.purposePoints[0].point_detail)
    const siteDescription = permitPurpose.purposePoints[0].point_detail.LOCAL_NAME

    const { HOURLY_QTY, DAILY_QTY, ANNUAL_QTY} = permitPurpose

    returnRequirements.push({
      returnsFrequency: _calculateCollectionFrequency(),
      isSummer: returnsCycle,
      abstractionPeriodStartDay: purpose.abstractionPeriodStartDay,
      abstractionPeriodStartMonth: purpose.abstractionPeriodStartMonth,
      abstractionPeriodEndDay: purpose.abstractionPeriodEndDay,
      abstractionPeriodEndMonth: purpose.abstractionPeriodEndMonth,
      siteDescription: purpose.descritpion
    })
  })

  return returnRequirements
}

function _calculateCollectionFrequency (purpose) {

}

function _calculateReturnsCycle (purpose) {
  const purposeStartDate = new Date(1970, purpose.abstractionPeriodStartMonth - 1, purpose.abstractionPeriodStartDay)
  const purposeEndDate = new Date(1970, purpose.abstractionPeriodEndMonth - 1, purpose.abstractionPeriodEndDay)

  const summerStartDate = new Date(1970, 3, 1)
  const summerEndDate = new Date(1970, 9, 31)

  if (purposeStartDate >= summerStartDate && purposeEndDate >= summerEndDate) {
    return true
  }

  return false
}

function _generateAbstractionPeriod (purpose) {
  const startDate = formatAbstractionDate(purpose.abstractionPeriodStartDay, purpose.abstractionPeriodStartMonth)
  const endDate = formatAbstractionDate(purpose.abstractionPeriodEndDay, purpose.abstractionPeriodEndMonth)

  return `From ${startDate} to ${endDate}`
}

module.exports = {
  go
}
