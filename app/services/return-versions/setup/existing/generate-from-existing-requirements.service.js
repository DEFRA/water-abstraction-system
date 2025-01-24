'use strict'

/**
 * Generates returns setup requirements from an existing return version
 * @module GenerateFromExistingRequirementsService
 */

const FetchExistingRequirementsService = require('./fetch-existing-requirements.service.js')

/**
 * Generates returns setup requirements from an existing return version
 *
 * In the returns setup journey we allow users to select the option to create new requirements by copying from them
 * from an existing return version. This service fetches the selected return version and its existing return
 * requirements. For each one found it generates a return requirement setup object.
 *
 * Note, we are not creating a `return_requirement` record but an object that matches what the setup journey expects.
 * This means the requirements will display correctly in the `/check` page, and users can amend the values using the
 * 'Change' links shown.
 *
 * @param {string} returnVersionId - The UUID of the selected return version to copy requirements from
 *
 * @returns {Promise<object>} the return version's return requirements transformed into an array of session return
 * requirements ready to be persisted to the setup session, plus whether the return version allows multiple uploads and
 * quarterly returns
 */
async function go(returnVersionId) {
  const returnVersion = await FetchExistingRequirementsService.go(returnVersionId)

  return {
    multipleUpload: returnVersion.multipleUpload,
    quarterlyReturns: returnVersion.quarterlyReturns,
    requirements: _transformForSetup(returnVersion),
    startDate: returnVersion.startDate
  }
}

function _agreementExceptions(returnRequirement) {
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

function _points(points) {
  return points.map((point) => {
    return point.id
  })
}

function _purposes(returnRequirementPurposes) {
  return returnRequirementPurposes.map((returnRequirementPurpose) => {
    const { description, id } = returnRequirementPurpose.purpose

    return {
      alias: returnRequirementPurpose.alias || '',
      description,
      id
    }
  })
}

function _siteDescription(siteDescription, points) {
  if (siteDescription) {
    return siteDescription
  }

  return points[0].description
}

function _transformForSetup(returnVersion) {
  const { returnRequirements } = returnVersion

  return returnRequirements.map((returnRequirement) => {
    const {
      abstractionPeriodEndDay,
      abstractionPeriodEndMonth,
      abstractionPeriodStartDay,
      abstractionPeriodStartMonth,
      collectionFrequency,
      points,
      reportingFrequency,
      returnRequirementPurposes,
      siteDescription,
      summer
    } = returnRequirement

    return {
      points: _points(points),
      purposes: _purposes(returnRequirementPurposes),
      returnsCycle: summer ? 'summer' : 'winter-and-all-year',
      siteDescription: _siteDescription(siteDescription, points),
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
