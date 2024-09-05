'use strict'

/**
 * Fetches an existing return version and generates setup return requirements from it
 * @module FetchExistingRequirementsService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Fetches an existing return version and generates setup return requirements from it
 *
 * In the returns setup journey we allow users to select the option to create new requirements by copying from them
 * from an existing return version. This service fetches the selected return version and its existing return
 * requirements. For each one found we generate a return requirement setup object.
 *
 * Note, we are not creating a `return_requirement` record but an object that matches what the setup journey expects.
 * This means the requirements will display correctly in the `/check` page, and users can amend the values using the
 * 'Change' links shown.
 *
 * @param {string} returnVersionId - The UUID of the selected return version to copy requirements from
 *
 * @returns {Promise<object[]>} an array of return requirements generated from the existing return version and ready to
 * be persisted to the setup session
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
        'alias',
        'id',
        'purposeId'
      ])
    })
    .withGraphFetched('returnRequirements.returnRequirementPurposes.purpose')
    .modifyGraph('returnRequirements.returnRequirementPurposes.purpose', (builder) => {
      builder.select([
        'id',
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
    const { description, id } = returnRequirementPurpose.purpose

    return {
      alias: returnRequirementPurpose.alias || '',
      description,
      id
    }
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
      frequencyReported: reportingFrequency,
      frequencyCollected: collectionFrequency,
      agreementsExceptions: _agreementExceptions(returnRequirement)
    }
  })
}

module.exports = {
  go
}
