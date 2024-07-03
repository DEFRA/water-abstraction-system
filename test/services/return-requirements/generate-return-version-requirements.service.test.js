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

describe('Generate Return Version Requirements service', () => {
  let licenceId
  let licencePointsData
  let naldRegionId
  let purposeId
  let primaryPurposeId
  let requirements
  let secondaryPurposeId

  beforeEach(async () => {
    const testRegion = await RegionHelper.add()
    naldRegionId = testRegion.naldRegionId

    const testLicence = await LicenceHelper.add({ regionId: testRegion.id })
    licenceId = testLicence.id
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a single requirement, purpose and point with no exemptions set', () => {
    beforeEach(async () => {
      purposeId = generateUUID()

      licencePointsData = [
        {
          ID: '59140',
          NGR1_EAST: '586',
          NGR2_EAST: 'null',
          NGR3_EAST: 'null',
          NGR4_EAST: 'null',
          LOCAL_NAME: 'SHERBORNE SPRINGS, LITTON',
          NGR1_NORTH: '550',
          NGR1_SHEET: 'ST',
          NGR2_NORTH: 'null',
          NGR2_SHEET: 'null',
          NGR3_NORTH: 'null',
          NGR3_SHEET: 'null',
          NGR4_NORTH: 'null',
          NGR4_SHEET: 'null'
        }
      ]

      requirements = [
        {
          points: [
            '59140'
          ],
          purposes: [
            purposeId
          ],
          returnsCycle: 'winter-and-all-year',
          siteDescription: 'Sherborne Spring, Litton',
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

      const { id: licenceVersionId } = await LicenceVersionHelper.add({ licenceId })
      const testLicenceVersionPurpose = await LicenceVersionPurposeHelper.add({ licenceVersionId, purposeId })

      primaryPurposeId = testLicenceVersionPurpose.primaryPurposeId
      secondaryPurposeId = testLicenceVersionPurpose.secondaryPurposeId

      Sinon.stub(FetchPointsService, 'go').resolves(licencePointsData)
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
      expect(result[0].returnRequirementPoints[0].description).to.equal(licencePointsData[0].LOCAL_NAME)
      expect(result[0].returnRequirementPoints[0].externalId).to.equal(
        `${result[0].externalId}:${licencePointsData[0].ID}`
      )
      expect(result[0].returnRequirementPoints[0].naldPointId).to.equal(licencePointsData[0].ID)
      expect(result[0].returnRequirementPoints[0].ngr1).to.equal(
        `${licencePointsData[0].NGR1_SHEET} ${licencePointsData[0].NGR1_EAST} ${licencePointsData[0].NGR1_NORTH}`
      )
      expect(result[0].returnRequirementPoints[0].ngr2).to.be.null()
      expect(result[0].returnRequirementPoints[0].ngr3).to.be.null()
      expect(result[0].returnRequirementPoints[0].ngr4).to.be.null()

      // The data that will populate the "return_requirement_purposes" table
      expect(result[0].returnRequirementPurposes).to.have.length(1)
      expect(result[0].returnRequirementPurposes[0].primaryPurposeId).to.equal(primaryPurposeId)
      expect(result[0].returnRequirementPurposes[0].purposeId).to.equal(purposeId)
      expect(result[0].returnRequirementPurposes[0].secondaryPurposeId).to.equal(secondaryPurposeId)
    })
  })
})
