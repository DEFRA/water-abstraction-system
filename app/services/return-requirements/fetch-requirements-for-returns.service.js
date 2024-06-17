'use strict'

/**
 * Fetches requirements for returns by the return version id
 * @module FetchRequirementsForReturnsService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')
const { frequencies } = require('../../lib/static-lookups.lib.js')

/**
 * Fetches requirements for returns by the return version id
 *
 * Includes the licence
 *
 * Formats the requirements
 *
 * @param {string} returnVersionId - The UUID of the selected return version to get requirements for
 *
 * @returns {Promise<Object>} The return version and its linked return requirements, plus their points and purposes
 */
async function go (returnVersionId) {
  const returnVersion = await _fetch(returnVersionId)

  return {
    ...returnVersion,
    returnRequirements: _transformForReturnRequirements(returnVersion.returnRequirements)
  }
}

function _agreementExceptions (returnRequirement) {
  const { fiftySixException, gravityFill, reabstraction, twoPartTariff } = returnRequirement
  const agreementsExceptions = []

  if (fiftySixException) {
    agreementsExceptions.push('56-returns-exception')
  }

  if (gravityFill) {
    agreementsExceptions.push('gravity-fill')
  }

  if (reabstraction) {
    agreementsExceptions.push('transfer-re-abstraction-scheme')
  }

  if (twoPartTariff) {
    agreementsExceptions.push('two-part-tariff')
  }

  if (agreementsExceptions.length === 0) {
    agreementsExceptions.push('none')
  }

  return agreementsExceptions
}

async function _fetch (returnVersionId) {
  return ReturnVersionModel.query()
    .findById(returnVersionId)
    .select([
      'id',
      'reason',
      'startDate',
      'status',
      'multiple_upload'
    ])
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select([
        'id'
      ]).modify('licenceHolder')
    })
    .withGraphFetched('returnRequirements')
    .modifyGraph('returnRequirements', (builder) => {
      builder.select([
        'id',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'collectionFrequency',
        'fiftySixException',
        'gravityFill',
        'reabstraction',
        'reportingFrequency',
        'siteDescription',
        'summer',
        'twoPartTariff',
        'legacyId'
      ])
    })
    .withGraphFetched('returnRequirements.returnRequirementPoints')
    .modifyGraph('returnRequirements.returnRequirementPoints', (builder) => {
      builder.select([
        'id',
        'naldPointId'
      ])
    })
    .withGraphFetched('returnRequirements.returnRequirementPurposes')
    .modifyGraph('returnRequirements.returnRequirementPurposes', (builder) => {
      builder.select([
        'id',
        'purposeId'
      ])
    })
    .withGraphFetched('returnRequirements.returnRequirementPurposes.purpose')
    .modifyGraph('returnRequirements.returnRequirementPurposes.purpose', (builder) => {
      builder.select([
        'description'
      ])
    })
}

function _points (returnRequirementPoints) {
  return returnRequirementPoints.map((returnRequirementPoint) => {
    return returnRequirementPoint.naldPointId.toString()
  })
}

function _purposes (returnRequirementPurposes) {
  return returnRequirementPurposes.map((returnRequirementPurpose) => {
    return returnRequirementPurpose.purpose.description
  })
}

function _transformForReturnRequirements (returnRequirements) {
  return returnRequirements.map((returnRequirement) => {
    const {
      abstractionPeriodEndDay,
      abstractionPeriodEndMonth,
      abstractionPeriodStartDay,
      abstractionPeriodStartMonth,
      collectionFrequency,
      reportingFrequency,
      returnRequirementPoints,
      returnRequirementPurposes,
      siteDescription,
      summer,
      legacyId
    } = returnRequirement

    return {
      points: _points(returnRequirementPoints),
      purposes: _purposes(returnRequirementPurposes),
      returnsCycle: summer ? 'summer' : 'winter-and-all-year',
      siteDescription,
      abstractionPeriod: {
        'end-abstraction-period-day': abstractionPeriodEndDay,
        'end-abstraction-period-month': abstractionPeriodEndMonth,
        'start-abstraction-period-day': abstractionPeriodStartDay,
        'start-abstraction-period-month': abstractionPeriodStartMonth
      },
      frequencyReported: frequencies[reportingFrequency],
      frequencyCollected: frequencies[collectionFrequency],
      agreementsExceptions: _agreementExceptions(returnRequirement),
      legacyId
    }
  })
}

module.exports = {
  go
}
