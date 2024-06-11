'use strict'

/**
 * Fetches existing return requirements to be copied from
 * @module FetchExistingRequirementsService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

const FREQUENCIES = {
  day: 'daily',
  week: 'weekly',
  fortnight: 'fortnightly',
  month: 'monthly',
  quarter: 'quarterly',
  year: 'yearly'
}

/**
 * Fetches existing return requirements to be copied from
 *
 * In the returns setup journey we allow users to select the option to create new requirements by copying from them
 * from an existing return version. This service fetches the selected return version and its requirements
 *
 * @param {string} returnVersionId - The UUID of the selected return version to copy requirements from
 *
 * @returns {Promise<Object>} The return version and its linked return requirements, plus their points and purposes
 */
async function go (returnVersionId) {
  const returnVersion = await _fetch(returnVersionId)

  return _transformForSetup(returnVersion)
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
      'id'
    ])
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
        'twoPartTariff'
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
}

function _points (returnRequirementPoints) {
  return returnRequirementPoints.map((returnRequirementPoint) => {
    return returnRequirementPoint.naldPointId.toString()
  })
}

function _purposes (returnRequirementPurposes) {
  return returnRequirementPurposes.map((returnRequirementPurpose) => {
    return returnRequirementPurpose.purposeId
  })
}

function _transformForSetup (returnVersion) {
  const { returnRequirements } = returnVersion

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
      summer
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
      frequencyReported: FREQUENCIES[reportingFrequency],
      frequencyCollected: FREQUENCIES[collectionFrequency],
      agreementsExceptions: _agreementExceptions(returnRequirement)
    }
  })
}

module.exports = {
  go
}
