'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Things we need to stub
const FetchPointsService = require('../../../app/services/return-requirements/fetch-points.service.js')

// Thing under test
const GenerateReturnVersionRequirementsService = require('../../../app/services/return-requirements/generate-return-version-requirements.service.js')

describe('Return Requirements - Generate Return Version Requirements service', () => {
  let licenceId
  let licencePoints
  let naldRegionId
  let requirements

  beforeEach(async () => {
    const region = RegionHelper.select()

    naldRegionId = region.naldRegionId

    const testLicence = await LicenceHelper.add({ regionId: region.id })

    licenceId = testLicence.id
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a single requirement, purpose and point with no exemptions set', () => {
    const purposeId = generateUUID()

    let primaryPurposeId
    let secondaryPurposeId

    beforeEach(async () => {
      licencePoints = _generateLicencePoints()

      requirements = _generateRequirements(purposeId)

      const { id: licenceVersionId } = await LicenceVersionHelper.add({ licenceId })
      const testLicenceVersionPurpose = await LicenceVersionPurposeHelper.add({ licenceVersionId, purposeId })

      primaryPurposeId = testLicenceVersionPurpose.primaryPurposeId
      secondaryPurposeId = testLicenceVersionPurpose.secondaryPurposeId

      Sinon.stub(FetchPointsService, 'go').resolves(licencePoints)
    })

    it('generates the data required to populate the return requirements tables', async () => {
      const result = await GenerateReturnVersionRequirementsService.go(licenceId, requirements)

      // The data that will populate the "return_requirements" table
      expect(result).to.have.length(1)
      expect(result[0].abstractionPeriodStartDay).to.equal(
        requirements[0].abstractionPeriod['start-abstraction-period-day']
      )
      expect(result[0].abstractionPeriodStartMonth).to.equal(
        requirements[0].abstractionPeriod['start-abstraction-period-month']
      )
      expect(result[0].abstractionPeriodEndDay).to.equal(
        requirements[0].abstractionPeriod['end-abstraction-period-day']
      )
      expect(result[0].abstractionPeriodEndMonth).to.equal(
        requirements[0].abstractionPeriod['end-abstraction-period-month']
      )
      expect(result[0].collectionFrequency).to.equal(requirements[0].frequencyCollected)
      expect(result[0].externalId).to.equal(`${naldRegionId}:${result[0].legacyId}`)
      expect(result[0].fiftySixException).to.be.false()
      expect(result[0].gravityFill).to.be.false()
      expect(result[0].legacyId).to.be.number()
      expect(result[0].reabstraction).to.be.false()
      expect(result[0].reportingFrequency).to.equal(requirements[0].frequencyReported)
      expect(result[0].returnsFrequency).to.equal('year')
      expect(result[0].siteDescription).to.equal(requirements[0].siteDescription)
      expect(result[0].summer).to.be.false()
      expect(result[0].twoPartTariff).to.be.false()

      // The data that will populate the "return_requirement_points" table
      expect(result[0].returnRequirementPoints).to.have.length(1)
      expect(result[0].returnRequirementPoints[0].description).to.equal(licencePoints[0].LOCAL_NAME)
      expect(result[0].returnRequirementPoints[0].externalId).to.equal(
        `${result[0].externalId}:${licencePoints[0].ID}`
      )
      expect(result[0].returnRequirementPoints[0].naldPointId).to.equal(licencePoints[0].ID)
      expect(result[0].returnRequirementPoints[0].ngr1).to.equal(
        `${licencePoints[0].NGR1_SHEET} ${licencePoints[0].NGR1_EAST} ${licencePoints[0].NGR1_NORTH}`
      )
      expect(result[0].returnRequirementPoints[0].ngr2).to.be.null()
      expect(result[0].returnRequirementPoints[0].ngr3).to.be.null()
      expect(result[0].returnRequirementPoints[0].ngr4).to.be.null()

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
      licencePoints = _generateLicencePoints('multiple')

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

      Sinon.stub(FetchPointsService, 'go').resolves(licencePoints)
    })

    it('generates the data required to populate the return requirements tables', async () => {
      const result = await GenerateReturnVersionRequirementsService.go(licenceId, requirements)

      // The data that will populate the "return_requirements" table
      expect(result).to.have.length(2)
      expect(result[1].abstractionPeriodStartDay).to.equal(
        requirements[1].abstractionPeriod['start-abstraction-period-day']
      )
      expect(result[1].abstractionPeriodStartMonth).to.equal(
        requirements[1].abstractionPeriod['start-abstraction-period-month']
      )
      expect(result[1].abstractionPeriodEndDay).to.equal(
        requirements[1].abstractionPeriod['end-abstraction-period-day']
      )
      expect(result[1].abstractionPeriodEndMonth).to.equal(
        requirements[1].abstractionPeriod['end-abstraction-period-month']
      )
      expect(result[1].collectionFrequency).to.equal(requirements[1].frequencyCollected)
      expect(result[1].externalId).to.equal(`${naldRegionId}:${result[1].legacyId}`)
      expect(result[1].fiftySixException).to.be.true()
      expect(result[1].gravityFill).to.be.true()
      expect(result[1].legacyId).to.be.number()
      expect(result[1].reabstraction).to.be.true()
      expect(result[1].reportingFrequency).to.equal(requirements[1].frequencyReported)
      expect(result[1].returnsFrequency).to.equal('year')
      expect(result[1].siteDescription).to.equal(requirements[1].siteDescription)
      expect(result[1].summer).to.be.true()
      expect(result[1].twoPartTariff).to.be.true()

      // The data that will populate the "return_requirement_points" table
      expect(result[1].returnRequirementPoints).to.have.length(2)
      expect(result[1].returnRequirementPoints[0].description).to.equal(licencePoints[0].LOCAL_NAME)
      expect(result[1].returnRequirementPoints[1].description).to.equal(licencePoints[2].LOCAL_NAME)
      expect(result[1].returnRequirementPoints[0].externalId).to.equal(
        `${result[1].externalId}:${licencePoints[0].ID}`
      )
      expect(result[1].returnRequirementPoints[1].externalId).to.equal(
        `${result[1].externalId}:${licencePoints[2].ID}`
      )
      expect(result[1].returnRequirementPoints[0].naldPointId).to.equal(licencePoints[0].ID)
      expect(result[1].returnRequirementPoints[1].naldPointId).to.equal(licencePoints[2].ID)
      expect(result[1].returnRequirementPoints[0].ngr1).to.equal(
        `${licencePoints[0].NGR1_SHEET} ${licencePoints[0].NGR1_EAST} ${licencePoints[0].NGR1_NORTH}`
      )
      expect(result[1].returnRequirementPoints[1].ngr1).to.equal(
        `${licencePoints[2].NGR1_SHEET} ${licencePoints[2].NGR1_EAST} ${licencePoints[2].NGR1_NORTH}`
      )
      expect(result[1].returnRequirementPoints[0].ngr2).to.be.null()
      expect(result[1].returnRequirementPoints[1].ngr2).to.equal(
        `${licencePoints[2].NGR2_SHEET} ${licencePoints[2].NGR2_EAST} ${licencePoints[2].NGR2_NORTH}`
      )
      expect(result[1].returnRequirementPoints[0].ngr3).to.be.null()
      expect(result[1].returnRequirementPoints[1].ngr3).to.equal(
        `${licencePoints[2].NGR3_SHEET} ${licencePoints[2].NGR3_EAST} ${licencePoints[2].NGR3_NORTH}`
      )
      expect(result[1].returnRequirementPoints[0].ngr4).to.be.null()
      expect(result[1].returnRequirementPoints[1].ngr4).to.equal(
        `${licencePoints[2].NGR4_SHEET} ${licencePoints[2].NGR4_EAST} ${licencePoints[2].NGR4_NORTH}`
      )

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

function _generateLicencePoints (multiplePoints) {
  const licencePoints = [
    {
      ID: '12345',
      NGR1_EAST: '123',
      NGR2_EAST: 'null',
      NGR3_EAST: 'null',
      NGR4_EAST: 'null',
      LOCAL_NAME: 'POINT NUMBER ONE',
      NGR1_NORTH: '456',
      NGR1_SHEET: 'ST',
      NGR2_NORTH: 'null',
      NGR2_SHEET: 'null',
      NGR3_NORTH: 'null',
      NGR3_SHEET: 'null',
      NGR4_NORTH: 'null',
      NGR4_SHEET: 'null'
    }
  ]

  const additionalPoints = [
    {
      ID: '99999',
      NGR1_EAST: '990',
      NGR2_EAST: 'null',
      NGR3_EAST: 'null',
      NGR4_EAST: 'null',
      LOCAL_NAME: 'POINT NUMBER TWO',
      NGR1_NORTH: '991',
      NGR1_SHEET: 'ZZ',
      NGR2_NORTH: 'null',
      NGR2_SHEET: 'null',
      NGR3_NORTH: 'null',
      NGR3_SHEET: 'null',
      NGR4_NORTH: 'null',
      NGR4_SHEET: 'null'
    },
    {
      ID: '67890',
      NGR1_EAST: '110',
      NGR2_EAST: '220',
      NGR3_EAST: '330',
      NGR4_EAST: '440',
      LOCAL_NAME: 'POINT NUMBER THREE',
      NGR1_NORTH: '111',
      NGR1_SHEET: 'AA',
      NGR2_NORTH: '221',
      NGR2_SHEET: 'BB',
      NGR3_NORTH: '331',
      NGR3_SHEET: 'CC',
      NGR4_NORTH: '441',
      NGR4_SHEET: 'DD'
    }
  ]

  if (multiplePoints) {
    licencePoints.push(...additionalPoints)
  }

  return licencePoints
}

function _generateRequirements (purposeOneId, purposeTwoId) {
  const requirements = [
    {
      points: [
        '12345'
      ],
      purposes: [
        {
          id: purposeOneId,
          alias: ''
        }
      ],
      returnsCycle: 'winter-and-all-year',
      siteDescription: 'Site Number One',
      abstractionPeriod: {
        'end-abstraction-period-day': 31,
        'end-abstraction-period-month': 3,
        'start-abstraction-period-day': 1,
        'start-abstraction-period-month': 4
      },
      frequencyReported: 'month',
      frequencyCollected: 'week',
      agreementsExceptions: [
        'none'
      ]
    }
  ]

  const additionalRequirements = {
    points: [
      '12345',
      '67890'
    ],
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
      'end-abstraction-period-day': '31',
      'end-abstraction-period-month': '8',
      'start-abstraction-period-day': '1',
      'start-abstraction-period-month': '6'
    },
    frequencyReported: 'day',
    frequencyCollected: 'day',
    agreementsExceptions: [
      'gravity-fill',
      'transfer-re-abstraction-scheme',
      'two-part-tariff',
      '56-returns-exception'
    ]
  }

  if (purposeTwoId) {
    requirements.push(additionalRequirements)
  }

  return requirements
}
