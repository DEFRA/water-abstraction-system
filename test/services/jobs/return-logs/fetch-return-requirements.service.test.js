'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const PointHelper = require('../../../support/helpers/point.helper.js')
const PrimaryPurposeHelper = require('../../../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../../../support/helpers/purpose.helper.js')
const ReturnCycleHelper = require('../../../support/helpers/return-cycle.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnRequirementHelper = require('../../../support/helpers/return-requirement.helper.js')
const ReturnRequirementModel = require('../../../../app/models/return-requirement.model.js')
const ReturnRequirementPointHelper = require('../../../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../../../support/helpers/return-requirement-purpose.helper.js')
const ReturnVersionHelper = require('../../../support/helpers/return-version.helper.js')
const SecondaryPurposeHelper = require('../../../support/helpers/secondary-purpose.helper.js')

// Thing under test
const FetchReturnRequirementsService = require('../../../../app/services/jobs/return-logs/fetch-return-requirements.service.js')

describe('Jobs - Return Logs - Fetch Return Requirements service', () => {
  let licence
  let point
  let primaryPurpose
  let purpose
  let region
  let returnCycle
  let returnRequirement
  let returnRequirementPurpose
  let returnVersion
  let secondaryPurpose

  describe('when the return cycle is "summer', () => {
    before(async () => {
      returnCycle = await ReturnCycleHelper.select(0, true)
    })

    describe('and there is a licence that does not end before the cycle starts', () => {
      before(async () => {
        region = RegionHelper.select()
        licence = await LicenceHelper.add({ regionId: region.id })
      })

      describe('and the licence has a return version that does not end before the cycle starts', () => {
        before(async () => {
          returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
        })

        describe('and the return version has a return requirement flagged as "summer"', () => {
          before(async () => {
            returnRequirement = await ReturnRequirementHelper.add({
              regionId: region.naldRegionId,
              returnVersionId: returnVersion.id,
              summer: true
            })

            primaryPurpose = PrimaryPurposeHelper.select()
            purpose = PurposeHelper.select()
            secondaryPurpose = SecondaryPurposeHelper.select()

            returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
              returnRequirementId: returnRequirement.id,
              primaryPurposeId: primaryPurpose.id,
              purposeId: purpose.id,
              secondaryPurposeId: secondaryPurpose.id
            })

            point = await PointHelper.add({
              description: 'Summer cycle - live licence - live return version - summer return requirement'
            })
            await ReturnRequirementPointHelper.add({
              returnRequirementId: returnRequirement.id,
              pointId: point.id
            })
          })

          describe('and the return requirement does not have an existing return log for the given cycle', () => {
            it('returns that matching return requirement and all related data needed to generate a return log', async () => {
              const results = await FetchReturnRequirementsService.go(returnCycle)

              const expected = ReturnRequirementModel.fromJson({
                abstractionPeriodEndDay: returnRequirement.abstractionPeriodEndDay,
                abstractionPeriodEndMonth: returnRequirement.abstractionPeriodEndMonth,
                abstractionPeriodStartDay: returnRequirement.abstractionPeriodStartDay,
                abstractionPeriodStartMonth: returnRequirement.abstractionPeriodStartMonth,
                externalId: returnRequirement.externalId,
                id: returnRequirement.id,
                legacyId: returnRequirement.legacyId,
                reportingFrequency: returnRequirement.reportingFrequency,
                returnVersionId: returnRequirement.returnVersionId,
                siteDescription: returnRequirement.siteDescription,
                summer: returnRequirement.summer,
                twoPartTariff: returnRequirement.twoPartTariff,
                upload: returnRequirement.upload,
                returnVersion: {
                  endDate: returnVersion.endDate,
                  id: returnVersion.id,
                  reason: returnVersion.reason,
                  startDate: returnVersion.startDate,
                  licence: {
                    expiredDate: licence.expiredDate,
                    id: licence.id,
                    lapsedDate: licence.lapsedDate,
                    licenceRef: licence.licenceRef,
                    revokedDate: licence.revokedDate,
                    areacode: 'SAAR',
                    region: {
                      id: region.id,
                      naldRegionId: region.naldRegionId
                    }
                  }
                },
                points: [
                  {
                    description: point.description,
                    ngr1: point.ngr1,
                    ngr2: point.ngr2,
                    ngr3: point.ngr3,
                    ngr4: point.ngr4
                  }
                ],
                returnRequirementPurposes: [
                  {
                    id: returnRequirementPurpose.id,
                    returnRequirementId: returnRequirement.id,
                    primaryPurposeId: returnRequirementPurpose.primaryPurposeId,
                    secondaryPurposeId: returnRequirementPurpose.secondaryPurposeId,
                    purposeId: returnRequirementPurpose.purposeId,
                    alias: returnRequirementPurpose.alias,
                    externalId: returnRequirementPurpose.externalId,
                    createdAt: returnRequirementPurpose.createdAt,
                    updatedAt: returnRequirementPurpose.updatedAt,
                    primaryPurpose: {
                      legacyId: primaryPurpose.legacyId,
                      description: primaryPurpose.description
                    },
                    purpose: {
                      legacyId: purpose.legacyId,
                      description: purpose.description
                    },
                    secondaryPurpose: {
                      legacyId: secondaryPurpose.legacyId,
                      description: secondaryPurpose.description
                    }
                  }
                ]
              })

              expect(results).to.include(expected)
            })
          })

          describe('but the return requirement has an existing return log for the given cycle', () => {
            before(async () => {
              await ReturnLogHelper.add({
                metadata: { nald: { regionCode: region.naldRegionId, return_reference: returnRequirement.legacyId } },
                returnCycleId: returnCycle.id,
                returnReference: returnRequirement.legacyId
              })
            })

            it('does not return that return requirement', async () => {
              const results = await FetchReturnRequirementsService.go(returnCycle)

              const resultIds = _resultIds(results)

              expect(resultIds).not.to.include(returnRequirement.id)
            })
          })
        })

        describe('and the return version has a return requirement flagged as "winter & all year"', () => {
          before(async () => {
            returnRequirement = await ReturnRequirementHelper.add({
              regionId: region.naldRegionId,
              returnVersionId: returnVersion.id,
              summer: false
            })

            primaryPurpose = PrimaryPurposeHelper.select()
            purpose = PurposeHelper.select()
            secondaryPurpose = SecondaryPurposeHelper.select()

            returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
              returnRequirementId: returnRequirement.id,
              primaryPurposeId: primaryPurpose.id,
              purposeId: purpose.id,
              secondaryPurposeId: secondaryPurpose.id
            })

            point = await PointHelper.add({
              description: 'Summer cycle - live licence - live return version - winter return requirement'
            })
            await ReturnRequirementPointHelper.add({
              returnRequirementId: returnRequirement.id,
              pointId: point.id
            })
          })

          it('does not return that return requirement', async () => {
            const results = await FetchReturnRequirementsService.go(returnCycle)

            const resultIds = _resultIds(results)

            expect(resultIds).not.to.include(returnRequirement.id)
          })
        })
      })

      describe('and the licence has a return version that ends before the cycle starts', () => {
        before(async () => {
          returnVersion = await ReturnVersionHelper.add({ endDate: new Date('2022-04-30'), licenceId: licence.id })
        })

        describe('and return version has a return requirement flagged as "summer"', () => {
          before(async () => {
            returnRequirement = await ReturnRequirementHelper.add({
              regionId: region.naldRegionId,
              returnVersionId: returnVersion.id,
              summer: true
            })

            primaryPurpose = PrimaryPurposeHelper.select()
            purpose = PurposeHelper.select()
            secondaryPurpose = SecondaryPurposeHelper.select()

            returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
              returnRequirementId: returnRequirement.id,
              primaryPurposeId: primaryPurpose.id,
              purposeId: purpose.id,
              secondaryPurposeId: secondaryPurpose.id
            })

            point = await PointHelper.add({
              description: 'Summer cycle - live licence - ended return version - summer return requirement'
            })
            await ReturnRequirementPointHelper.add({
              returnRequirementId: returnRequirement.id,
              pointId: point.id
            })
          })

          it('does not return that return requirement', async () => {
            const results = await FetchReturnRequirementsService.go(returnCycle)

            const resultIds = _resultIds(results)

            expect(resultIds).not.to.include(returnRequirement.id)
          })
        })
      })
    })

    describe('and there is a licence that ends before the cycle starts', () => {
      before(async () => {
        region = RegionHelper.select()
        licence = await LicenceHelper.add({ expiredDate: new Date('2022-04-30'), regionId: region.id })
      })

      describe('and the licence has a return version that does not end before the cycle starts', () => {
        before(async () => {
          returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
        })

        describe('and the return version has a return requirement flagged as "summer"', () => {
          before(async () => {
            returnRequirement = await ReturnRequirementHelper.add({
              regionId: region.naldRegionId,
              returnVersionId: returnVersion.id,
              summer: true
            })

            primaryPurpose = PrimaryPurposeHelper.select()
            purpose = PurposeHelper.select()
            secondaryPurpose = SecondaryPurposeHelper.select()

            returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
              returnRequirementId: returnRequirement.id,
              primaryPurposeId: primaryPurpose.id,
              purposeId: purpose.id,
              secondaryPurposeId: secondaryPurpose.id
            })

            point = await PointHelper.add({
              description: 'Summer cycle - ended licence - live return version - summer return requirement'
            })
            await ReturnRequirementPointHelper.add({
              returnRequirementId: returnRequirement.id,
              pointId: point.id
            })
          })

          it('does not return that return requirement', async () => {
            const results = await FetchReturnRequirementsService.go(returnCycle)

            const resultIds = _resultIds(results)

            expect(resultIds).not.to.include(returnRequirement.id)
          })
        })
      })
    })
  })

  describe('when the return cycle is "winter & all year"', () => {
    before(async () => {
      returnCycle = await ReturnCycleHelper.select(0, false)
    })

    describe('and there is a licence that does not end before the cycle starts', () => {
      before(async () => {
        region = RegionHelper.select()
        licence = await LicenceHelper.add({ regionId: region.id })
      })

      describe('and the licence has a return version that does not end before the cycle starts', () => {
        before(async () => {
          returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
        })

        describe('and the return version has a return requirement flagged as "winter & all year"', () => {
          before(async () => {
            returnRequirement = await ReturnRequirementHelper.add({
              regionId: region.naldRegionId,
              returnVersionId: returnVersion.id,
              summer: false
            })

            primaryPurpose = PrimaryPurposeHelper.select()
            purpose = PurposeHelper.select()
            secondaryPurpose = SecondaryPurposeHelper.select()

            returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
              returnRequirementId: returnRequirement.id,
              primaryPurposeId: primaryPurpose.id,
              purposeId: purpose.id,
              secondaryPurposeId: secondaryPurpose.id
            })

            point = await PointHelper.add({
              description: 'Winter cycle - live licence - live return version - winter return requirement'
            })
            await ReturnRequirementPointHelper.add({
              returnRequirementId: returnRequirement.id,
              pointId: point.id
            })
          })

          describe('and the return requirement does not have an existing return log for the given cycle', () => {
            it('returns that matching return requirement and all related data needed to generate a return log', async () => {
              const results = await FetchReturnRequirementsService.go(returnCycle)

              const expected = ReturnRequirementModel.fromJson({
                abstractionPeriodEndDay: returnRequirement.abstractionPeriodEndDay,
                abstractionPeriodEndMonth: returnRequirement.abstractionPeriodEndMonth,
                abstractionPeriodStartDay: returnRequirement.abstractionPeriodStartDay,
                abstractionPeriodStartMonth: returnRequirement.abstractionPeriodStartMonth,
                externalId: returnRequirement.externalId,
                id: returnRequirement.id,
                legacyId: returnRequirement.legacyId,
                reportingFrequency: returnRequirement.reportingFrequency,
                returnVersionId: returnRequirement.returnVersionId,
                siteDescription: returnRequirement.siteDescription,
                summer: returnRequirement.summer,
                twoPartTariff: returnRequirement.twoPartTariff,
                upload: returnRequirement.upload,
                returnVersion: {
                  endDate: returnVersion.endDate,
                  id: returnVersion.id,
                  reason: returnVersion.reason,
                  startDate: returnVersion.startDate,
                  licence: {
                    expiredDate: licence.expiredDate,
                    id: licence.id,
                    lapsedDate: licence.lapsedDate,
                    licenceRef: licence.licenceRef,
                    revokedDate: licence.revokedDate,
                    areacode: 'SAAR',
                    region: {
                      id: region.id,
                      naldRegionId: region.naldRegionId
                    }
                  }
                },
                points: [
                  {
                    description: point.description,
                    ngr1: point.ngr1,
                    ngr2: point.ngr2,
                    ngr3: point.ngr3,
                    ngr4: point.ngr4
                  }
                ],
                returnRequirementPurposes: [
                  {
                    id: returnRequirementPurpose.id,
                    returnRequirementId: returnRequirement.id,
                    primaryPurposeId: returnRequirementPurpose.primaryPurposeId,
                    secondaryPurposeId: returnRequirementPurpose.secondaryPurposeId,
                    purposeId: returnRequirementPurpose.purposeId,
                    alias: returnRequirementPurpose.alias,
                    externalId: returnRequirementPurpose.externalId,
                    createdAt: returnRequirementPurpose.createdAt,
                    updatedAt: returnRequirementPurpose.updatedAt,
                    primaryPurpose: {
                      legacyId: primaryPurpose.legacyId,
                      description: primaryPurpose.description
                    },
                    purpose: {
                      legacyId: purpose.legacyId,
                      description: purpose.description
                    },
                    secondaryPurpose: {
                      legacyId: secondaryPurpose.legacyId,
                      description: secondaryPurpose.description
                    }
                  }
                ]
              })

              expect(results).to.include(expected)
            })
          })

          describe('but the return requirement has an existing return log for the given cycle', () => {
            before(async () => {
              await ReturnLogHelper.add({
                metadata: { nald: { regionCode: region.naldRegionId, return_reference: returnRequirement.legacyId } },
                returnCycleId: returnCycle.id,
                returnReference: returnRequirement.legacyId
              })
            })

            it('does not return that return requirement', async () => {
              const results = await FetchReturnRequirementsService.go(returnCycle)

              const resultIds = _resultIds(results)

              expect(resultIds).not.to.include(returnRequirement.id)
            })
          })
        })

        describe('and the return version has a return requirement flagged as "summer"', () => {
          before(async () => {
            returnRequirement = await ReturnRequirementHelper.add({
              regionId: region.naldRegionId,
              returnVersionId: returnVersion.id,
              summer: true
            })

            primaryPurpose = PrimaryPurposeHelper.select()
            purpose = PurposeHelper.select()
            secondaryPurpose = SecondaryPurposeHelper.select()

            returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
              returnRequirementId: returnRequirement.id,
              primaryPurposeId: primaryPurpose.id,
              purposeId: purpose.id,
              secondaryPurposeId: secondaryPurpose.id
            })

            point = await PointHelper.add({
              description: 'Winter cycle - live licence - live return version - summer return requirement'
            })
            await ReturnRequirementPointHelper.add({
              returnRequirementId: returnRequirement.id,
              pointId: point.id
            })
          })

          it('does not return that return requirement', async () => {
            const results = await FetchReturnRequirementsService.go(returnCycle)

            const resultIds = _resultIds(results)

            expect(resultIds).not.to.include(returnRequirement.id)
          })
        })
      })

      describe('and the licence has a return version that ends before the cycle starts', () => {
        before(async () => {
          returnVersion = await ReturnVersionHelper.add({ endDate: new Date('2022-04-30'), licenceId: licence.id })
        })

        describe('and the return version has a return requirement flagged as "winter & all year"', () => {
          before(async () => {
            returnRequirement = await ReturnRequirementHelper.add({
              regionId: region.naldRegionId,
              returnVersionId: returnVersion.id,
              summer: false
            })

            primaryPurpose = PrimaryPurposeHelper.select()
            purpose = PurposeHelper.select()
            secondaryPurpose = SecondaryPurposeHelper.select()

            returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
              returnRequirementId: returnRequirement.id,
              primaryPurposeId: primaryPurpose.id,
              purposeId: purpose.id,
              secondaryPurposeId: secondaryPurpose.id
            })

            point = await PointHelper.add({
              description: 'Winter cycle - live licence - ended return version - winter return requirement'
            })
            await ReturnRequirementPointHelper.add({
              returnRequirementId: returnRequirement.id,
              pointId: point.id
            })
          })

          it('does not return that return requirement', async () => {
            const results = await FetchReturnRequirementsService.go(returnCycle)

            const resultIds = _resultIds(results)

            expect(resultIds).not.to.include(returnRequirement.id)
          })
        })
      })
    })

    describe('and there is a licence that ends before the cycle starts', () => {
      before(async () => {
        region = RegionHelper.select()
        licence = await LicenceHelper.add({ expiredDate: new Date('2022-04-30'), regionId: region.id })
      })

      describe('and the licence has a return version that does not end before the cycle starts', () => {
        before(async () => {
          returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
        })

        describe('and the return version has a return requirement flagged as "winter & all year"', () => {
          before(async () => {
            returnRequirement = await ReturnRequirementHelper.add({
              regionId: region.naldRegionId,
              returnVersionId: returnVersion.id,
              summer: false
            })

            primaryPurpose = PrimaryPurposeHelper.select()
            purpose = PurposeHelper.select()
            secondaryPurpose = SecondaryPurposeHelper.select()

            returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
              returnRequirementId: returnRequirement.id,
              primaryPurposeId: primaryPurpose.id,
              purposeId: purpose.id,
              secondaryPurposeId: secondaryPurpose.id
            })

            point = await PointHelper.add({
              description: 'Winter cycle - ended licence - live return version - winter return requirement'
            })
            await ReturnRequirementPointHelper.add({
              returnRequirementId: returnRequirement.id,
              pointId: point.id
            })
          })

          it('does not return that return requirement', async () => {
            const results = await FetchReturnRequirementsService.go(returnCycle)

            const resultIds = _resultIds(results)

            expect(resultIds).not.to.include(returnRequirement.id)
          })
        })
      })
    })
  })
})

function _resultIds(results) {
  return results.map((result) => {
    return result.id
  })
}
