'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../../app/lib/general.lib.js')
const ReturnVersionModel = require('../../../../../app/models/return-version.model.js')
const ReturnRequirementModel = require('../../../../../app/models/return-requirement.model.js')
const ReturnRequirementPointModel = require('../../../../../app/models/return-requirement-point.model.js')
const ReturnRequirementPurposeModel = require('../../../../../app/models/return-requirement-purpose.model.js')

// Thing under test
const PersistReturnVersionService = require('../../../../../app/services/return-versions/setup/check/persist-return-version.service.js')

describe('Return Versions Setup - Persist Return Version service', () => {
  describe('when called with data to persist', () => {
    let licenceId
    let returnVersionData

    beforeEach(() => {
      licenceId = generateUUID()
      returnVersionData = _generateReturnVersionData(licenceId)
    })

    it('persists the data to the tables required to create a new Return Version', async () => {
      await PersistReturnVersionService.go(returnVersionData)

      const returnVersion = await ReturnVersionModel.query().where(
        'licenceId',
        returnVersionData.returnVersion.licenceId
      )

      expect(returnVersion).to.have.length(1)
      expect(returnVersion[0].createdBy).to.equal(returnVersionData.returnVersion.createdBy)
      expect(returnVersion[0].endDate).to.be.null()
      expect(returnVersion[0].licenceId).to.equal(returnVersionData.returnVersion.licenceId)
      expect(returnVersion[0].multipleUpload).to.be.true()
      expect(returnVersion[0].notes).to.equal(returnVersionData.returnVersion.notes)
      expect(returnVersion[0].reason).to.equal(returnVersionData.returnVersion.reason)
      expect(returnVersion[0].startDate).to.equal(returnVersionData.returnVersion.startDate)
      expect(returnVersion[0].status).to.equal(returnVersionData.returnVersion.status)
      expect(returnVersion[0].version).to.equal(returnVersionData.returnVersion.version)

      const returnRequirement = await ReturnRequirementModel.query().where('returnVersionId', returnVersion[0].id)
      const requirementData = returnVersionData.returnRequirements[0]

      expect(returnRequirement).to.have.length(1)
      expect(returnRequirement[0].abstractionPeriodStartDay).to.equal(1)
      expect(returnRequirement[0].abstractionPeriodStartMonth).to.equal(4)
      expect(returnRequirement[0].abstractionPeriodEndDay).to.equal(31)
      expect(returnRequirement[0].abstractionPeriodEndMonth).to.equal(3)
      expect(returnRequirement[0].collectionFrequency).to.equal(requirementData.collectionFrequency)
      expect(returnRequirement[0].fiftySixException).to.equal(requirementData.fiftySixException)
      expect(returnRequirement[0].gravityFill).to.equal(requirementData.gravityFill)
      expect(returnRequirement[0].reabstraction).to.equal(requirementData.reabstraction)
      expect(returnRequirement[0].reportingFrequency).to.equal(requirementData.reportingFrequency)
      expect(returnRequirement[0].returnsFrequency).to.equal(requirementData.returnsFrequency)
      expect(returnRequirement[0].returnVersionId).to.equal(returnVersion[0].id)
      expect(returnRequirement[0].siteDescription).to.equal(requirementData.siteDescription)
      expect(returnRequirement[0].summer).to.equal(requirementData.summer)
      expect(returnRequirement[0].twoPartTariff).to.equal(requirementData.twoPartTariff)

      const returnRequirementPoint = await ReturnRequirementPointModel.query().where(
        'returnRequirementId',
        returnRequirement[0].id
      )
      const pointData = returnVersionData.returnRequirements[0].points[0]

      expect(returnRequirementPoint).to.have.length(1)
      expect(returnRequirementPoint[0].pointId).to.equal(pointData)

      const returnRequirementPurpose = await ReturnRequirementPurposeModel.query().where(
        'returnRequirementId',
        returnRequirement[0].id
      )
      const purposeData = returnVersionData.returnRequirements[0].returnRequirementPurposes[0]

      expect(returnRequirementPurpose).to.have.length(1)
      expect(returnRequirementPurpose[0].alias).to.equal(purposeData.alias)
      expect(returnRequirementPurpose[0].primaryPurposeId).to.equal(purposeData.primaryPurposeId)
      expect(returnRequirementPurpose[0].purposeId).to.equal(purposeData.purposeId)
      expect(returnRequirementPurpose[0].secondaryPurposeId).to.equal(purposeData.secondaryPurposeId)
    })
  })
})

function _generateReturnVersionData() {
  return {
    returnRequirements: [
      {
        abstractionPeriodStartDay: '1',
        abstractionPeriodStartMonth: '4',
        abstractionPeriodEndDay: '31',
        abstractionPeriodEndMonth: '3',
        collectionFrequency: 'week',
        fiftySixException: false,
        gravityFill: false,
        reabstraction: false,
        reportingFrequency: 'month',
        returnsFrequency: 'year',
        points: [generateUUID()],
        returnRequirementPurposes: [
          {
            alias: 'This is a purpose alias',
            primaryPurposeId: generateUUID(),
            purposeId: generateUUID(),
            secondaryPurposeId: generateUUID()
          }
        ],
        siteDescription: 'Site description',
        summer: false,
        twoPartTariff: false
      }
    ],
    returnVersion: {
      createdBy: 100327,
      endDate: null,
      licenceId: generateUUID(),
      multipleUpload: true,
      notes: 'This is a test note',
      reason: 'new-special-agreement',
      startDate: new Date('2023-02-13'),
      status: 'current',
      version: 103
    }
  }
}
