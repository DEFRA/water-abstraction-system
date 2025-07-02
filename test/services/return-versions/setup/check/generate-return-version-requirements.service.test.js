'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../../app/lib/general.lib.js')
const LicenceHelper = require('../../../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../../../support/helpers/licence-version-purpose.helper.js')
const RegionHelper = require('../../../../support/helpers/region.helper.js')

// Thing under test
const GenerateReturnVersionRequirementsService = require('../../../../../app/services/return-versions/setup/check/generate-return-version-requirements.service.js')

describe('Return Versions - Setup - Generate Return Version Requirements service', () => {
  let licenceId
  let requirements

  beforeEach(async () => {
    const region = RegionHelper.select()

    const testLicence = await LicenceHelper.add({ regionId: region.id })

    licenceId = testLicence.id
  })

  describe('when called with a single requirement, purpose and point with no exemptions set', () => {
    const purposeId = generateUUID()

    let primaryPurposeId
    let secondaryPurposeId

    beforeEach(async () => {
      requirements = _generateRequirements(purposeId)

      const { id: licenceVersionId } = await LicenceVersionHelper.add({ licenceId })
      const testLicenceVersionPurpose = await LicenceVersionPurposeHelper.add({ licenceVersionId, purposeId })

      primaryPurposeId = testLicenceVersionPurpose.primaryPurposeId
      secondaryPurposeId = testLicenceVersionPurpose.secondaryPurposeId
    })

    it('generates the data required to populate the return requirements tables', async () => {
      const result = await GenerateReturnVersionRequirementsService.go(licenceId, requirements)

      // The data that will populate the "return_requirements" table
      expect(result).to.have.length(1)
      expect(result[0].abstractionPeriodStartDay).to.equal(
        requirements[0].abstractionPeriod['abstraction-period-start-day']
      )
      expect(result[0].abstractionPeriodStartMonth).to.equal(
        requirements[0].abstractionPeriod['abstraction-period-start-month']
      )
      expect(result[0].abstractionPeriodEndDay).to.equal(
        requirements[0].abstractionPeriod['abstraction-period-end-day']
      )
      expect(result[0].abstractionPeriodEndMonth).to.equal(
        requirements[0].abstractionPeriod['abstraction-period-end-month']
      )
      expect(result[0].collectionFrequency).to.equal(requirements[0].frequencyCollected)
      expect(result[0].fiftySixException).to.be.false()
      expect(result[0].gravityFill).to.be.false()
      expect(result[0].reabstraction).to.be.false()
      expect(result[0].reportingFrequency).to.equal(requirements[0].frequencyReported)
      expect(result[0].returnsFrequency).to.equal('year')
      expect(result[0].siteDescription).to.equal(requirements[0].siteDescription)
      expect(result[0].summer).to.be.false()
      expect(result[0].twoPartTariff).to.be.false()

      // The data that will populate the "return_requirement_points" table
      expect(result[0].points).to.have.length(1)
      expect(result[0].points[0]).to.equal('796f83bb-d50d-446f-bc47-28daff6bcb78')

      // The data that will populate the "return_requirement_purposes" table
      expect(result[0].returnRequirementPurposes).to.have.length(1)
      expect(result[0].returnRequirementPurposes[0].alias).to.be.null()
      expect(result[0].returnRequirementPurposes[0].primaryPurposeId).to.equal(primaryPurposeId)
      expect(result[0].returnRequirementPurposes[0].purposeId).to.equal(purposeId)
      expect(result[0].returnRequirementPurposes[0].secondaryPurposeId).to.equal(secondaryPurposeId)
    })
  })

  describe('when called with multiple requirements, purposes and points with all exemptions set', () => {
    const purposeOneId = generateUUID()
    const purposeTwoId = generateUUID()

    let primaryPurposeOneId
    let primaryPurposeTwoId
    let secondaryPurposeOneId
    let secondaryPurposeTwoId

    beforeEach(async () => {
      // licencePoints = _generateLicencePoints('multiple')

      requirements = _generateRequirements(purposeOneId, purposeTwoId)

      const { id: licenceVersionId } = await LicenceVersionHelper.add({ licenceId })
      const testLicenceVersionPurposeOne = await LicenceVersionPurposeHelper.add({
        licenceVersionId,
        purposeId: purposeOneId
      })
      const testLicenceVersionPurposeTwo = await LicenceVersionPurposeHelper.add({
        licenceVersionId,
        purposeId: purposeTwoId
      })

      primaryPurposeOneId = testLicenceVersionPurposeOne.primaryPurposeId
      primaryPurposeTwoId = testLicenceVersionPurposeTwo.primaryPurposeId
      secondaryPurposeOneId = testLicenceVersionPurposeOne.secondaryPurposeId
      secondaryPurposeTwoId = testLicenceVersionPurposeTwo.secondaryPurposeId
    })

    it('generates the data required to populate the return requirements tables', async () => {
      const result = await GenerateReturnVersionRequirementsService.go(licenceId, requirements)

      // The data that will populate the "return_requirements" table
      expect(result).to.have.length(2)
      expect(result[1].abstractionPeriodStartDay).to.equal(
        requirements[1].abstractionPeriod['abstraction-period-start-day']
      )
      expect(result[1].abstractionPeriodStartMonth).to.equal(
        requirements[1].abstractionPeriod['abstraction-period-start-month']
      )
      expect(result[1].abstractionPeriodEndDay).to.equal(
        requirements[1].abstractionPeriod['abstraction-period-end-day']
      )
      expect(result[1].abstractionPeriodEndMonth).to.equal(
        requirements[1].abstractionPeriod['abstraction-period-end-month']
      )
      expect(result[1].collectionFrequency).to.equal(requirements[1].frequencyCollected)
      expect(result[1].fiftySixException).to.be.true()
      expect(result[1].gravityFill).to.be.true()
      expect(result[1].reabstraction).to.be.true()
      expect(result[1].reportingFrequency).to.equal(requirements[1].frequencyReported)
      expect(result[1].returnsFrequency).to.equal('year')
      expect(result[1].siteDescription).to.equal(requirements[1].siteDescription)
      expect(result[1].summer).to.be.true()
      expect(result[1].twoPartTariff).to.be.true()

      // The data that will populate the "return_requirement_points" table
      expect(result[1].points).to.have.length(2)
      expect(result[1].points[0]).to.equal('30070341-ef94-4df8-87dd-31d51a046b8b')
      expect(result[1].points[1]).to.equal('916a1320-0f57-43b2-bddc-b609218abf1c')

      // The data that will populate the "return_requirement_purposes" table
      expect(result[1].returnRequirementPurposes).to.have.length(2)
      expect(result[1].returnRequirementPurposes[0].alias).to.be.null()
      expect(result[1].returnRequirementPurposes[1].alias).to.equal('This is the second purpose test alias')
      expect(result[1].returnRequirementPurposes[0].primaryPurposeId).to.equal(primaryPurposeOneId)
      expect(result[1].returnRequirementPurposes[1].primaryPurposeId).to.equal(primaryPurposeTwoId)
      expect(result[1].returnRequirementPurposes[0].purposeId).to.equal(purposeOneId)
      expect(result[1].returnRequirementPurposes[1].purposeId).to.equal(purposeTwoId)
      expect(result[1].returnRequirementPurposes[0].secondaryPurposeId).to.equal(secondaryPurposeOneId)
      expect(result[1].returnRequirementPurposes[1].secondaryPurposeId).to.equal(secondaryPurposeTwoId)
    })
  })
})

function _generateRequirements(purposeOneId, purposeTwoId) {
  const requirements = [
    {
      points: ['796f83bb-d50d-446f-bc47-28daff6bcb78'],
      purposes: [
        {
          id: purposeOneId,
          alias: ''
        }
      ],
      returnsCycle: 'winter-and-all-year',
      siteDescription: 'Site Number One',
      abstractionPeriod: {
        'abstraction-period-end-day': 31,
        'abstraction-period-end-month': 3,
        'abstraction-period-start-day': 1,
        'abstraction-period-start-month': 4
      },
      frequencyReported: 'month',
      frequencyCollected: 'week',
      agreementsExceptions: ['none']
    }
  ]

  const additionalRequirements = {
    points: ['30070341-ef94-4df8-87dd-31d51a046b8b', '916a1320-0f57-43b2-bddc-b609218abf1c'],
    purposes: [
      {
        id: purposeOneId,
        alias: ''
      },
      {
        id: purposeTwoId,
        alias: 'This is the second purpose test alias'
      }
    ],
    returnsCycle: 'summer',
    siteDescription: 'Site Number Two',
    // NOTE: When abstraction periods are manually entered they are saved in the session as strings rather than integers
    // The ORM isn't fussy and correctly converts the strings to integers when writing the data to the database
    abstractionPeriod: {
      'abstraction-period-end-day': '31',
      'abstraction-period-end-month': '8',
      'abstraction-period-start-day': '1',
      'abstraction-period-start-month': '6'
    },
    frequencyReported: 'day',
    frequencyCollected: 'day',
    agreementsExceptions: ['gravity-fill', 'transfer-re-abstraction-scheme', 'two-part-tariff', '56-returns-exception']
  }

  if (purposeTwoId) {
    requirements.push(additionalRequirements)
  }

  return requirements
}
