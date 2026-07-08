'use strict'

// Test helpers
const { generateUUID } = require('../../../../../app/lib/general.lib.js')
const ReturnVersionModel = require('../../../../../app/models/return-version.model.js')
const ReturnRequirementModel = require('../../../../../app/models/return-requirement.model.js')
const ReturnRequirementPointModel = require('../../../../../app/models/return-requirement-point.model.js')
const ReturnRequirementPurposeModel = require('../../../../../app/models/return-requirement-purpose.model.js')

// Thing under test
const CreateReturnVersionService = require('../../../../../app/services/return-versions/setup/check/create-return-version.service.js')

describe('Return Versions Setup - Create Return Version service', () => {
  describe('when called with data to create', () => {
    let licenceId
    let returnVersionData

    beforeEach(() => {
      licenceId = generateUUID()
      returnVersionData = _generateReturnVersionData(licenceId)
    })

    it('creates a new Return Version', async () => {
      await CreateReturnVersionService(returnVersionData)

      const returnVersion = await ReturnVersionModel.query().where(
        'licenceId',
        returnVersionData.returnVersion.licenceId
      )

      expect(returnVersion).toHaveLength(1)
      expect(returnVersion[0].createdBy).toEqual(returnVersionData.returnVersion.createdBy)
      expect(returnVersion[0].endDate).toBeNull()
      expect(returnVersion[0].licenceId).toEqual(returnVersionData.returnVersion.licenceId)
      expect(returnVersion[0].multipleUpload).toBe(true)
      expect(returnVersion[0].notes).toEqual(returnVersionData.returnVersion.notes)
      expect(returnVersion[0].reason).toEqual(returnVersionData.returnVersion.reason)
      expect(returnVersion[0].startDate).toEqual(returnVersionData.returnVersion.startDate)
      expect(returnVersion[0].status).toEqual(returnVersionData.returnVersion.status)
      expect(returnVersion[0].version).toEqual(returnVersionData.returnVersion.version)

      const returnRequirement = await ReturnRequirementModel.query().where('returnVersionId', returnVersion[0].id)
      const requirementData = returnVersionData.returnRequirements[0]

      expect(returnRequirement).toHaveLength(1)
      expect(returnRequirement[0].abstractionPeriodStartDay).toEqual(1)
      expect(returnRequirement[0].abstractionPeriodStartMonth).toEqual(4)
      expect(returnRequirement[0].abstractionPeriodEndDay).toEqual(31)
      expect(returnRequirement[0].abstractionPeriodEndMonth).toEqual(3)
      expect(returnRequirement[0].collectionFrequency).toEqual(requirementData.collectionFrequency)
      expect(returnRequirement[0].fiftySixException).toEqual(requirementData.fiftySixException)
      expect(returnRequirement[0].gravityFill).toEqual(requirementData.gravityFill)
      expect(returnRequirement[0].reabstraction).toEqual(requirementData.reabstraction)
      expect(returnRequirement[0].reportingFrequency).toEqual(requirementData.reportingFrequency)
      expect(returnRequirement[0].returnsFrequency).toEqual(requirementData.returnsFrequency)
      expect(returnRequirement[0].returnVersionId).toEqual(returnVersion[0].id)
      expect(returnRequirement[0].siteDescription).toEqual(requirementData.siteDescription)
      expect(returnRequirement[0].summer).toEqual(requirementData.summer)
      expect(returnRequirement[0].twoPartTariff).toEqual(requirementData.twoPartTariff)

      const returnRequirementPoint = await ReturnRequirementPointModel.query().where(
        'returnRequirementId',
        returnRequirement[0].id
      )
      const pointData = returnVersionData.returnRequirements[0].points[0]

      expect(returnRequirementPoint).toHaveLength(1)
      expect(returnRequirementPoint[0].pointId).toEqual(pointData)

      const returnRequirementPurpose = await ReturnRequirementPurposeModel.query().where(
        'returnRequirementId',
        returnRequirement[0].id
      )
      const purposeData = returnVersionData.returnRequirements[0].returnRequirementPurposes[0]

      expect(returnRequirementPurpose).toHaveLength(1)
      expect(returnRequirementPurpose[0].alias).toEqual(purposeData.alias)
      expect(returnRequirementPurpose[0].primaryPurposeId).toEqual(purposeData.primaryPurposeId)
      expect(returnRequirementPurpose[0].purposeId).toEqual(purposeData.purposeId)
      expect(returnRequirementPurpose[0].secondaryPurposeId).toEqual(purposeData.secondaryPurposeId)
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
