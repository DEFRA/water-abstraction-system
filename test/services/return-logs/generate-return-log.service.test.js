'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { formatDateObjectToISO } = require('../../../app/lib/dates.lib.js')
const FetchReturnRequirementsService = require('../../../app/services/return-logs/fetch-return-requirements.service.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const PointHelper = require('../../support/helpers/point.helper.js')
const PrimaryPurposeHelper = require('../../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const ReturnCycleHelper = require('../../support/helpers/return-cycle.helper.js')
const ReturnRequirementHelper = require('../../support/helpers/return-requirement.helper.js')
const ReturnRequirementPointHelper = require('../../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../../support/helpers/return-requirement-purpose.helper.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')
const SecondaryPurposeHelper = require('../../support/helpers/secondary-purpose.helper.js')

// Thing under test
const GenerateReturnLogService = require('../../../app/services/return-logs/generate-return-log.service.js')

describe('Return Logs - Generate Return Log service', () => {
  const today = new Date()
  const year = today.getFullYear()

  let endDate
  let expiredDate
  let lapsedDate
  let licence
  let point
  let primaryPurpose
  let purpose
  let region
  let returnCycle
  let returnVersion
  let returnRequirement
  let returnRequirementPurpose
  let returnRequirements
  let revokedDate
  let secondaryPurpose
  let startDate
  let summer

  describe('when provided an all year return cycle and a return requirement', () => {
    before(async () => {
      summer = false
      returnCycle = await ReturnCycleHelper.select(0, summer)
      startDate = formatDateObjectToISO(returnCycle.startDate)
      endDate = formatDateObjectToISO(returnCycle.endDate)
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

      returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        alias: null,
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })

      returnRequirements = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)
    })

    it('should return a valid return log payload', () => {
      const result = GenerateReturnLogService.go(returnRequirements[0], returnCycle)

      expect(result.dueDate).to.equal(returnCycle.dueDate)
      expect(result.endDate).to.equal(endDate)
      expect(result.id).to.equal(
        `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${startDate}:${endDate}`
      )
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: false,
        isSummer: false,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [
          {
            name: point.description,
            ngr1: point.ngr1,
            ngr2: point.ngr2,
            ngr3: point.ngr3,
            ngr4: point.ngr4
          }
        ],
        purposes: [
          {
            primary: {
              code: primaryPurpose.legacyId,
              description: primaryPurpose.description
            },
            secondary: {
              code: secondaryPurpose.legacyId,
              description: secondaryPurpose.description
            },
            tertiary: {
              code: purpose.legacyId,
              description: purpose.description
            }
          }
        ],
        version: 1
      })
      expect(result.returnCycleId).to.equal(returnCycle.id)
      expect(result.returnsFrequency).to.equal('day')
      expect(result.startDate).to.equal(startDate)
      expect(result.status).to.equal('due')
      expect(result.source).to.equal('WRLS')
    })
  })

  describe('when provided an all year return cycle, there is an expired date and one return requirement', () => {
    before(async () => {
      summer = false
      returnCycle = await ReturnCycleHelper.select(0, summer)
      startDate = formatDateObjectToISO(returnCycle.startDate)
      endDate = formatDateObjectToISO(returnCycle.endDate)
      expiredDate = new Date(year + 1, 1, 31).toISOString().split('T')[0]
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ expiredDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

      returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })

      returnRequirements = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)
    })

    it('should return one return log payload', () => {
      const result = GenerateReturnLogService.go(returnRequirements[0], returnCycle)

      expect(result.dueDate).to.equal(returnCycle.dueDate)
      expect(result.endDate).to.equal(expiredDate)
      expect(result.id).to.equal(
        `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${startDate}:${expiredDate}`
      )
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: true,
        isSummer: false,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [
          {
            name: point.description,
            ngr1: point.ngr1,
            ngr2: point.ngr2,
            ngr3: point.ngr3,
            ngr4: point.ngr4
          }
        ],
        purposes: [
          {
            alias: returnRequirementPurpose.alias,
            primary: {
              code: primaryPurpose.legacyId,
              description: primaryPurpose.description
            },
            secondary: {
              code: secondaryPurpose.legacyId,
              description: secondaryPurpose.description
            },
            tertiary: {
              code: purpose.legacyId,
              description: purpose.description
            }
          }
        ],
        version: 1
      })
      expect(result.returnCycleId).to.equal(returnCycle.id)
      expect(result.returnsFrequency).to.equal('day')
      expect(result.startDate).to.equal(startDate)
      expect(result.status).to.equal('due')
      expect(result.source).to.equal('WRLS')
    })
  })

  describe('when provided an all year return cycle, there is an expired date after the end of the cycle', () => {
    before(async () => {
      summer = false
      returnCycle = await ReturnCycleHelper.select(0, summer)
      startDate = formatDateObjectToISO(returnCycle.startDate)
      endDate = formatDateObjectToISO(returnCycle.endDate)
      expiredDate = new Date(year + 1, 3, 31).toISOString().split('T')[0]
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ expiredDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

      returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })

      returnRequirements = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)
    })

    it('should return one return log payload', () => {
      const result = GenerateReturnLogService.go(returnRequirements[0], returnCycle)

      expect(result.dueDate).to.equal(returnCycle.dueDate)
      expect(result.endDate).to.equal(endDate)
      expect(result.id).to.equal(
        `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${startDate}:${endDate}`
      )
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: false,
        isSummer: false,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [
          {
            name: point.description,
            ngr1: point.ngr1,
            ngr2: point.ngr2,
            ngr3: point.ngr3,
            ngr4: point.ngr4
          }
        ],
        purposes: [
          {
            alias: returnRequirementPurpose.alias,
            primary: {
              code: primaryPurpose.legacyId,
              description: primaryPurpose.description
            },
            secondary: {
              code: secondaryPurpose.legacyId,
              description: secondaryPurpose.description
            },
            tertiary: {
              code: purpose.legacyId,
              description: purpose.description
            }
          }
        ],
        version: 1
      })
      expect(result.returnCycleId).to.equal(returnCycle.id)
      expect(result.returnsFrequency).to.equal('day')
      expect(result.startDate).to.equal(startDate)
      expect(result.status).to.equal('due')
      expect(result.source).to.equal('WRLS')
    })
  })

  describe('when provided a summer return cycle and a return requirement', () => {
    before(async () => {
      summer = true
      returnCycle = await ReturnCycleHelper.select(0, summer)
      startDate = formatDateObjectToISO(returnCycle.startDate)
      endDate = formatDateObjectToISO(returnCycle.endDate)
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

      returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        alias: null,
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })

      returnRequirements = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)
    })

    it('should return a valid return log payload', () => {
      const result = GenerateReturnLogService.go(returnRequirements[0], returnCycle)

      expect(result.dueDate).to.equal(returnCycle.dueDate)
      expect(result.endDate).to.equal(endDate)
      expect(result.id).to.equal(
        `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${startDate}:${endDate}`
      )
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: false,
        isSummer: true,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [
          {
            name: point.description,
            ngr1: point.ngr1,
            ngr2: point.ngr2,
            ngr3: point.ngr3,
            ngr4: point.ngr4
          }
        ],
        purposes: [
          {
            primary: {
              code: primaryPurpose.legacyId,
              description: primaryPurpose.description
            },
            secondary: {
              code: secondaryPurpose.legacyId,
              description: secondaryPurpose.description
            },
            tertiary: {
              code: purpose.legacyId,
              description: purpose.description
            }
          }
        ],
        version: 1
      })
      expect(result.returnCycleId).to.equal(returnCycle.id)
      expect(result.returnsFrequency).to.equal('day')
      expect(result.startDate).to.equal(startDate)
      expect(result.status).to.equal('due')
      expect(result.source).to.equal('WRLS')
    })
  })

  describe('when provided a summer return cycle and a return requirement on a licence with a lapsed date', () => {
    before(async () => {
      summer = true
      returnCycle = await ReturnCycleHelper.select(0, summer)
      startDate = formatDateObjectToISO(returnCycle.startDate)
      endDate = formatDateObjectToISO(returnCycle.endDate)
      lapsedDate = new Date(year + 1, 1, 31).toISOString().split('T')[0]

      region = RegionHelper.select()
      licence = await LicenceHelper.add({ lapsedDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

      returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        alias: null,
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })

      returnRequirements = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)
    })

    it('should return a valid return log payload', () => {
      const result = GenerateReturnLogService.go(returnRequirements[0], returnCycle)

      expect(result.dueDate).to.equal(returnCycle.dueDate)
      expect(result.endDate).to.equal(lapsedDate)
      expect(result.id).to.equal(
        `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${startDate}:${lapsedDate}`
      )
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: true,
        isSummer: true,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [
          {
            name: point.description,
            ngr1: point.ngr1,
            ngr2: point.ngr2,
            ngr3: point.ngr3,
            ngr4: point.ngr4
          }
        ],
        purposes: [
          {
            primary: {
              code: primaryPurpose.legacyId,
              description: primaryPurpose.description
            },
            secondary: {
              code: secondaryPurpose.legacyId,
              description: secondaryPurpose.description
            },
            tertiary: {
              code: purpose.legacyId,
              description: purpose.description
            }
          }
        ],
        version: 1
      })
      expect(result.returnCycleId).to.equal(returnCycle.id)
      expect(result.returnsFrequency).to.equal('day')
      expect(result.startDate).to.equal(startDate)
      expect(result.status).to.equal('due')
      expect(result.source).to.equal('WRLS')
    })
  })

  describe('when provided a summer return cycle and a return requirement on a licence with a revoked date', () => {
    before(async () => {
      summer = true
      returnCycle = await ReturnCycleHelper.select(0, summer)
      startDate = formatDateObjectToISO(returnCycle.startDate)
      endDate = formatDateObjectToISO(returnCycle.endDate)
      revokedDate = new Date(year + 1, 1, 31).toISOString().split('T')[0]

      region = RegionHelper.select()
      licence = await LicenceHelper.add({ revokedDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

      returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        alias: null,
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })

      returnRequirements = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)
    })

    it('should return a valid return log payload', () => {
      const result = GenerateReturnLogService.go(returnRequirements[0], returnCycle)

      expect(result.dueDate).to.equal(returnCycle.dueDate)
      expect(result.endDate).to.equal(revokedDate)
      expect(result.id).to.equal(
        `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${startDate}:${revokedDate}`
      )
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: true,
        isSummer: true,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [
          {
            name: point.description,
            ngr1: point.ngr1,
            ngr2: point.ngr2,
            ngr3: point.ngr3,
            ngr4: point.ngr4
          }
        ],
        purposes: [
          {
            primary: {
              code: primaryPurpose.legacyId,
              description: primaryPurpose.description
            },
            secondary: {
              code: secondaryPurpose.legacyId,
              description: secondaryPurpose.description
            },
            tertiary: {
              code: purpose.legacyId,
              description: purpose.description
            }
          }
        ],
        version: 1
      })
      expect(result.returnCycleId).to.equal(returnCycle.id)
      expect(result.returnsFrequency).to.equal('day')
      expect(result.startDate).to.equal(startDate)
      expect(result.status).to.equal('due')
      expect(result.source).to.equal('WRLS')
    })
  })

  describe('when provided a summer return cycle and a return requirement on a licence with a revoked date after the current cycle', () => {
    before(async () => {
      summer = true
      returnCycle = await ReturnCycleHelper.select(0, summer)
      startDate = formatDateObjectToISO(returnCycle.startDate)
      endDate = formatDateObjectToISO(returnCycle.endDate)
      revokedDate = new Date(year + 1, 10, 31).toISOString().split('T')[0]

      region = RegionHelper.select()
      licence = await LicenceHelper.add({ revokedDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

      returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        alias: null,
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })

      returnRequirements = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)
    })

    it('should return a valid return log payload', () => {
      const result = GenerateReturnLogService.go(returnRequirements[0], returnCycle)

      expect(result.dueDate).to.equal(returnCycle.dueDate)
      expect(result.endDate).to.equal(endDate)
      expect(result.id).to.equal(
        `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${startDate}:${endDate}`
      )
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: false,
        isSummer: true,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [
          {
            name: point.description,
            ngr1: point.ngr1,
            ngr2: point.ngr2,
            ngr3: point.ngr3,
            ngr4: point.ngr4
          }
        ],
        purposes: [
          {
            primary: {
              code: primaryPurpose.legacyId,
              description: primaryPurpose.description
            },
            secondary: {
              code: secondaryPurpose.legacyId,
              description: secondaryPurpose.description
            },
            tertiary: {
              code: purpose.legacyId,
              description: purpose.description
            }
          }
        ],
        version: 1
      })
      expect(result.returnCycleId).to.equal(returnCycle.id)
      expect(result.returnsFrequency).to.equal('day')
      expect(result.startDate).to.equal(startDate)
      expect(result.status).to.equal('due')
      expect(result.source).to.equal('WRLS')
    })
  })

  describe('when provided a summer return cycle and a return requirement on a licence with a start date after the current cycle start date', () => {
    before(async () => {
      summer = true
      returnCycle = await ReturnCycleHelper.select(0, summer)
      startDate = formatDateObjectToISO(new Date(`${returnCycle.startDate.getFullYear()}-11-01`))
      endDate = formatDateObjectToISO(returnCycle.endDate)
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ revokedDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })

      returnRequirement = await ReturnRequirementHelper.add({ summer, returnVersionId: returnVersion.id })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        alias: null,
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })

      returnRequirements = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)
    })

    it('should return a valid return log payload', () => {
      const result = GenerateReturnLogService.go(returnRequirements[0], returnCycle)

      expect(result.dueDate).to.equal(returnCycle.dueDate)
      expect(result.endDate).to.equal(endDate)
      expect(result.id).to.equal(
        `v1:${region.naldRegionId}:${licence.licenceRef}:${returnRequirement.legacyId}:${startDate}:${endDate}`
      )
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.metadata).to.equal({
        description: 'BOREHOLE AT AVALON',
        isCurrent: true,
        isFinal: false,
        isSummer: true,
        isTwoPartTariff: false,
        isUpload: false,
        nald: {
          regionCode: region.naldRegionId,
          areaCode: licence.regions.historicalAreaCode,
          formatId: returnRequirement.legacyId,
          periodStartDay: returnRequirement.abstractionPeriodStartDay.toString(),
          periodStartMonth: returnRequirement.abstractionPeriodStartMonth.toString(),
          periodEndDay: returnRequirement.abstractionPeriodEndDay.toString(),
          periodEndMonth: returnRequirement.abstractionPeriodEndMonth.toString()
        },
        points: [
          {
            name: point.description,
            ngr1: point.ngr1,
            ngr2: point.ngr2,
            ngr3: point.ngr3,
            ngr4: point.ngr4
          }
        ],
        purposes: [
          {
            primary: {
              code: primaryPurpose.legacyId,
              description: primaryPurpose.description
            },
            secondary: {
              code: secondaryPurpose.legacyId,
              description: secondaryPurpose.description
            },
            tertiary: {
              code: purpose.legacyId,
              description: purpose.description
            }
          }
        ],
        version: 1
      })
      expect(result.returnCycleId).to.equal(returnCycle.id)
      expect(result.returnsFrequency).to.equal('day')
      expect(result.startDate).to.equal(startDate)
      expect(result.status).to.equal('due')
      expect(result.source).to.equal('WRLS')
    })
  })
})
