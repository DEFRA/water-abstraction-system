'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { formatDateObjectToISO } = require('../../../app/lib/dates.lib.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const PointHelper = require('../../support/helpers/point.helper.js')
const PrimaryPurposeHelper = require('../../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const ReturnCycleHelper = require('../../support/helpers/return-cycle.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const ReturnRequirementHelper = require('../../support/helpers/return-requirement.helper.js')
const ReturnRequirementPointHelper = require('../../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../../support/helpers/return-requirement-purpose.helper.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')
const SecondaryPurposeHelper = require('../../support/helpers/secondary-purpose.helper.js')

// Thing under test
const FetchReturnRequirementsService = require('../../../app/services/return-logs/fetch-return-requirements.service.js')

describe('Fetch return requirements service', () => {
  const summerReturns = []
  const allYearReturns = []

  let expiredDate
  let lapsedDate
  let licence
  let point
  let point2
  let primaryPurpose
  let primaryPurpose2
  let purpose
  let purpose2
  let region
  let returnCycle
  let returnVersion
  let returnRequirement
  let returnRequirement2
  let returnRequirementPurpose
  let returnRequirementPurpose2
  let revokedDate
  let secondaryPurpose
  let secondaryPurpose2
  let startDate

  describe('when provided a summer return cycle, one return requirement and a licenceRef provided', () => {
    before(async () => {
      returnCycle = await ReturnCycleHelper.select(0, true)
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id,
        summer: true
      })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
      summerReturns.push(returnRequirement.legacyId)
    })

    it('should return one return log payload', async () => {
      const result = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].id).to.equal(returnRequirement.id)
      expect(result[0].returnVersionId).to.equal(returnVersion.id)
      expect(result[0].reportingFrequency).to.equal(returnRequirement.reportingFrequency)
      expect(result[0].summer).to.equal(returnRequirement.summer)
      expect(result[0].upload).to.equal(returnRequirement.upload)
      expect(result[0].abstractionPeriodStartDay).to.equal(returnRequirement.abstractionPeriodStartDay)
      expect(result[0].abstractionPeriodStartMonth).to.equal(returnRequirement.abstractionPeriodStartMonth)
      expect(result[0].abstractionPeriodEndDay).to.equal(returnRequirement.abstractionPeriodEndDay)
      expect(result[0].abstractionPeriodEndMonth).to.equal(returnRequirement.abstractionPeriodEndMonth)
      expect(result[0].siteDescription).to.equal(returnRequirement.siteDescription)
      expect(result[0].legacyId).to.equal(returnRequirement.legacyId)
      expect(result[0].externalId).to.equal(returnRequirement.externalId)
      expect(result[0].twoPartTariff).to.equal(returnRequirement.twoPartTariff)
      expect(result[0].returnVersion.endDate).to.equal(returnVersion.endDate)
      expect(result[0].returnVersion.id).to.equal(returnVersion.id)
      expect(result[0].returnVersion.startDate).to.equal(returnVersion.startDate)
      expect(result[0].returnVersion.reason).to.equal(returnVersion.reason)
      expect(result[0].returnVersion.licence.id).to.equal(licence.id)
      expect(result[0].returnVersion.licence.expiredDate).to.equal(licence.expiredDate)
      expect(result[0].returnVersion.licence.lapsedDate).to.equal(licence.lapsedDate)
      expect(result[0].returnVersion.licence.licenceRef).to.equal(licence.licenceRef)
      expect(result[0].returnVersion.licence.revokedDate).to.equal(licence.revokedDate)
      expect(result[0].returnVersion.licence.areacode).to.equal(licence.regions.historicalAreaCode)
      expect(result[0].returnVersion.licence.region.id).to.equal(region.id)
      expect(result[0].returnVersion.licence.region.naldRegionId).to.equal(region.naldRegionId)
      expect(result[0].points[0].description).to.equal(point.description)
      expect(result[0].points[0].ngr1).to.equal(point.ngr1)
      expect(result[0].points[0].ngr2).to.equal(point.ngr2)
      expect(result[0].points[0].ngr3).to.equal(point.ngr3)
      expect(result[0].points[0].ngr4).to.equal(point.ngr4)
      expect(result[0].returnRequirementPurposes[0].id).to.equal(returnRequirementPurpose.id)
      expect(result[0].returnRequirementPurposes[0].returnRequirementId).to.equal(
        returnRequirementPurpose.returnRequirementId
      )
      expect(result[0].returnRequirementPurposes[0].primaryPurposeId).to.equal(
        returnRequirementPurpose.primaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].secondaryPurposeId).to.equal(
        returnRequirementPurpose.secondaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].purposeId).to.equal(returnRequirementPurpose.purposeId)
      expect(result[0].returnRequirementPurposes[0].alias).to.equal(returnRequirementPurpose.alias)
      expect(result[0].returnRequirementPurposes[0].externalId).to.equal(returnRequirementPurpose.externalId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.legacyId).to.equal(primaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.description).to.equal(primaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.legacyId).to.equal(secondaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.description).to.equal(secondaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].purpose.legacyId).to.equal(purpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].purpose.description).to.equal(purpose.description)
    })
  })

  describe('when summer is false, two return requirements and a licenceRef provided', () => {
    before(async () => {
      returnCycle = await ReturnCycleHelper.select(0, false)
      primaryPurpose = PrimaryPurposeHelper.select()
      primaryPurpose2 = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      purpose2 = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      secondaryPurpose2 = SecondaryPurposeHelper.select()
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id
      })
      returnRequirement2 = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id
      })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
      point2 = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point2.id, returnRequirementId: returnRequirement2.id })
      returnRequirementPurpose2 = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose2.id,
        purposeId: purpose2.id,
        returnRequirementId: returnRequirement2.id,
        secondaryPurposeId: secondaryPurpose2.id
      })
      allYearReturns.push(returnRequirement.legacyId)
    })

    it('should return two return log payloads', async () => {
      const result = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)

      expect(result.length).to.equal(2)
      expect(result[0].id).to.equal(returnRequirement.id)
      expect(result[0].returnVersionId).to.equal(returnVersion.id)
      expect(result[0].reportingFrequency).to.equal(returnRequirement.reportingFrequency)
      expect(result[0].summer).to.equal(returnRequirement.summer)
      expect(result[0].upload).to.equal(returnRequirement.upload)
      expect(result[0].abstractionPeriodStartDay).to.equal(returnRequirement.abstractionPeriodStartDay)
      expect(result[0].abstractionPeriodStartMonth).to.equal(returnRequirement.abstractionPeriodStartMonth)
      expect(result[0].abstractionPeriodEndDay).to.equal(returnRequirement.abstractionPeriodEndDay)
      expect(result[0].abstractionPeriodEndMonth).to.equal(returnRequirement.abstractionPeriodEndMonth)
      expect(result[0].siteDescription).to.equal(returnRequirement.siteDescription)
      expect(result[0].legacyId).to.equal(returnRequirement.legacyId)
      expect(result[0].externalId).to.equal(returnRequirement.externalId)
      expect(result[0].twoPartTariff).to.equal(returnRequirement.twoPartTariff)
      expect(result[0].returnVersion.endDate).to.equal(returnVersion.endDate)
      expect(result[0].returnVersion.id).to.equal(returnVersion.id)
      expect(result[0].returnVersion.startDate).to.equal(returnVersion.startDate)
      expect(result[0].returnVersion.reason).to.equal(returnVersion.reason)
      expect(result[0].returnVersion.licence.id).to.equal(licence.id)
      expect(result[0].returnVersion.licence.expiredDate).to.equal(licence.expiredDate)
      expect(result[0].returnVersion.licence.lapsedDate).to.equal(licence.lapsedDate)
      expect(result[0].returnVersion.licence.licenceRef).to.equal(licence.licenceRef)
      expect(result[0].returnVersion.licence.revokedDate).to.equal(licence.revokedDate)
      expect(result[0].returnVersion.licence.areacode).to.equal(licence.regions.historicalAreaCode)
      expect(result[0].returnVersion.licence.region.id).to.equal(region.id)
      expect(result[0].returnVersion.licence.region.naldRegionId).to.equal(region.naldRegionId)
      expect(result[0].points[0].description).to.equal(point.description)
      expect(result[0].points[0].ngr1).to.equal(point.ngr1)
      expect(result[0].points[0].ngr2).to.equal(point.ngr2)
      expect(result[0].points[0].ngr3).to.equal(point.ngr3)
      expect(result[0].points[0].ngr4).to.equal(point.ngr4)
      expect(result[0].returnRequirementPurposes[0].id).to.equal(returnRequirementPurpose.id)
      expect(result[0].returnRequirementPurposes[0].returnRequirementId).to.equal(
        returnRequirementPurpose.returnRequirementId
      )
      expect(result[0].returnRequirementPurposes[0].primaryPurposeId).to.equal(
        returnRequirementPurpose.primaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].secondaryPurposeId).to.equal(
        returnRequirementPurpose.secondaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].purposeId).to.equal(returnRequirementPurpose.purposeId)
      expect(result[0].returnRequirementPurposes[0].alias).to.equal(returnRequirementPurpose.alias)
      expect(result[0].returnRequirementPurposes[0].externalId).to.equal(returnRequirementPurpose.externalId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.legacyId).to.equal(primaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.description).to.equal(primaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.legacyId).to.equal(secondaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.description).to.equal(secondaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].purpose.legacyId).to.equal(purpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].purpose.description).to.equal(purpose.description)
      expect(result[1].id).to.equal(returnRequirement2.id)
      expect(result[1].returnVersionId).to.equal(returnVersion.id)
      expect(result[1].reportingFrequency).to.equal(returnRequirement2.reportingFrequency)
      expect(result[1].summer).to.equal(returnRequirement2.summer)
      expect(result[1].upload).to.equal(returnRequirement2.upload)
      expect(result[1].abstractionPeriodStartDay).to.equal(returnRequirement2.abstractionPeriodStartDay)
      expect(result[1].abstractionPeriodStartMonth).to.equal(returnRequirement2.abstractionPeriodStartMonth)
      expect(result[1].abstractionPeriodEndDay).to.equal(returnRequirement2.abstractionPeriodEndDay)
      expect(result[1].abstractionPeriodEndMonth).to.equal(returnRequirement2.abstractionPeriodEndMonth)
      expect(result[1].siteDescription).to.equal(returnRequirement2.siteDescription)
      expect(result[1].legacyId).to.equal(returnRequirement2.legacyId)
      expect(result[1].externalId).to.equal(returnRequirement2.externalId)
      expect(result[1].twoPartTariff).to.equal(returnRequirement2.twoPartTariff)
      expect(result[1].returnVersion.endDate).to.equal(returnVersion.endDate)
      expect(result[1].returnVersion.id).to.equal(returnVersion.id)
      expect(result[1].returnVersion.startDate).to.equal(returnVersion.startDate)
      expect(result[1].returnVersion.reason).to.equal(returnVersion.reason)
      expect(result[1].returnVersion.licence.id).to.equal(licence.id)
      expect(result[1].returnVersion.licence.expiredDate).to.equal(licence.expiredDate)
      expect(result[1].returnVersion.licence.lapsedDate).to.equal(licence.lapsedDate)
      expect(result[1].returnVersion.licence.licenceRef).to.equal(licence.licenceRef)
      expect(result[1].returnVersion.licence.revokedDate).to.equal(licence.revokedDate)
      expect(result[1].returnVersion.licence.areacode).to.equal(licence.regions.historicalAreaCode)
      expect(result[1].returnVersion.licence.region.id).to.equal(region.id)
      expect(result[1].returnVersion.licence.region.naldRegionId).to.equal(region.naldRegionId)
      expect(result[1].points[0].description).to.equal(point2.description)
      expect(result[1].points[0].ngr1).to.equal(point2.ngr1)
      expect(result[1].points[0].ngr2).to.equal(point2.ngr2)
      expect(result[1].points[0].ngr3).to.equal(point2.ngr3)
      expect(result[1].points[0].ngr4).to.equal(point2.ngr4)
      expect(result[1].returnRequirementPurposes[0].id).to.equal(returnRequirementPurpose2.id)
      expect(result[1].returnRequirementPurposes[0].returnRequirementId).to.equal(
        returnRequirementPurpose2.returnRequirementId
      )
      expect(result[1].returnRequirementPurposes[0].primaryPurposeId).to.equal(
        returnRequirementPurpose2.primaryPurposeId
      )
      expect(result[1].returnRequirementPurposes[0].secondaryPurposeId).to.equal(
        returnRequirementPurpose2.secondaryPurposeId
      )
      expect(result[1].returnRequirementPurposes[0].purposeId).to.equal(returnRequirementPurpose2.purposeId)
      expect(result[1].returnRequirementPurposes[0].alias).to.equal(returnRequirementPurpose2.alias)
      expect(result[1].returnRequirementPurposes[0].externalId).to.equal(returnRequirementPurpose2.externalId)
      expect(result[1].returnRequirementPurposes[0].primaryPurpose.legacyId).to.equal(primaryPurpose2.legacyId)
      expect(result[1].returnRequirementPurposes[0].primaryPurpose.description).to.equal(primaryPurpose2.description)
      expect(result[1].returnRequirementPurposes[0].secondaryPurpose.legacyId).to.equal(secondaryPurpose2.legacyId)
      expect(result[1].returnRequirementPurposes[0].secondaryPurpose.description).to.equal(
        secondaryPurpose2.description
      )
      expect(result[1].returnRequirementPurposes[0].purpose.legacyId).to.equal(purpose2.legacyId)
      expect(result[1].returnRequirementPurposes[0].purpose.description).to.equal(purpose2.description)
    })
  })

  describe('when summer is true, two return requirements and a licenceRef provided', () => {
    before(async () => {
      returnCycle = await ReturnCycleHelper.select(0, true)
      primaryPurpose = PrimaryPurposeHelper.select()
      primaryPurpose2 = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      purpose2 = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      secondaryPurpose2 = SecondaryPurposeHelper.select()
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id,
        summer: true
      })
      returnRequirement2 = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id,
        summer: true
      })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
      point2 = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point2.id, returnRequirementId: returnRequirement2.id })
      returnRequirementPurpose2 = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose2.id,
        purposeId: purpose2.id,
        returnRequirementId: returnRequirement2.id,
        secondaryPurposeId: secondaryPurpose2.id
      })
      summerReturns.push(returnRequirement.legacyId)
      summerReturns.push(returnRequirement2.legacyId)
    })

    it('should return two return log payloads', async () => {
      const result = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)

      expect(result.length).to.equal(2)
      expect(result[0].id).to.equal(returnRequirement.id)
      expect(result[0].returnVersionId).to.equal(returnVersion.id)
      expect(result[0].reportingFrequency).to.equal(returnRequirement.reportingFrequency)
      expect(result[0].summer).to.equal(returnRequirement.summer)
      expect(result[0].upload).to.equal(returnRequirement.upload)
      expect(result[0].abstractionPeriodStartDay).to.equal(returnRequirement.abstractionPeriodStartDay)
      expect(result[0].abstractionPeriodStartMonth).to.equal(returnRequirement.abstractionPeriodStartMonth)
      expect(result[0].abstractionPeriodEndDay).to.equal(returnRequirement.abstractionPeriodEndDay)
      expect(result[0].abstractionPeriodEndMonth).to.equal(returnRequirement.abstractionPeriodEndMonth)
      expect(result[0].siteDescription).to.equal(returnRequirement.siteDescription)
      expect(result[0].legacyId).to.equal(returnRequirement.legacyId)
      expect(result[0].externalId).to.equal(returnRequirement.externalId)
      expect(result[0].twoPartTariff).to.equal(returnRequirement.twoPartTariff)
      expect(result[0].returnVersion.endDate).to.equal(returnVersion.endDate)
      expect(result[0].returnVersion.id).to.equal(returnVersion.id)
      expect(result[0].returnVersion.startDate).to.equal(returnVersion.startDate)
      expect(result[0].returnVersion.reason).to.equal(returnVersion.reason)
      expect(result[0].returnVersion.licence.id).to.equal(licence.id)
      expect(result[0].returnVersion.licence.expiredDate).to.equal(licence.expiredDate)
      expect(result[0].returnVersion.licence.lapsedDate).to.equal(licence.lapsedDate)
      expect(result[0].returnVersion.licence.licenceRef).to.equal(licence.licenceRef)
      expect(result[0].returnVersion.licence.revokedDate).to.equal(licence.revokedDate)
      expect(result[0].returnVersion.licence.areacode).to.equal(licence.regions.historicalAreaCode)
      expect(result[0].returnVersion.licence.region.id).to.equal(region.id)
      expect(result[0].returnVersion.licence.region.naldRegionId).to.equal(region.naldRegionId)
      expect(result[0].points[0].description).to.equal(point.description)
      expect(result[0].points[0].ngr1).to.equal(point.ngr1)
      expect(result[0].points[0].ngr2).to.equal(point.ngr2)
      expect(result[0].points[0].ngr3).to.equal(point.ngr3)
      expect(result[0].points[0].ngr4).to.equal(point.ngr4)
      expect(result[0].returnRequirementPurposes[0].id).to.equal(returnRequirementPurpose.id)
      expect(result[0].returnRequirementPurposes[0].returnRequirementId).to.equal(
        returnRequirementPurpose.returnRequirementId
      )
      expect(result[0].returnRequirementPurposes[0].primaryPurposeId).to.equal(
        returnRequirementPurpose.primaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].secondaryPurposeId).to.equal(
        returnRequirementPurpose.secondaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].purposeId).to.equal(returnRequirementPurpose.purposeId)
      expect(result[0].returnRequirementPurposes[0].alias).to.equal(returnRequirementPurpose.alias)
      expect(result[0].returnRequirementPurposes[0].externalId).to.equal(returnRequirementPurpose.externalId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.legacyId).to.equal(primaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.description).to.equal(primaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.legacyId).to.equal(secondaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.description).to.equal(secondaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].purpose.legacyId).to.equal(purpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].purpose.description).to.equal(purpose.description)
      expect(result[1].id).to.equal(returnRequirement2.id)
      expect(result[1].returnVersionId).to.equal(returnVersion.id)
      expect(result[1].reportingFrequency).to.equal(returnRequirement2.reportingFrequency)
      expect(result[1].summer).to.equal(returnRequirement2.summer)
      expect(result[1].upload).to.equal(returnRequirement2.upload)
      expect(result[1].abstractionPeriodStartDay).to.equal(returnRequirement2.abstractionPeriodStartDay)
      expect(result[1].abstractionPeriodStartMonth).to.equal(returnRequirement2.abstractionPeriodStartMonth)
      expect(result[1].abstractionPeriodEndDay).to.equal(returnRequirement2.abstractionPeriodEndDay)
      expect(result[1].abstractionPeriodEndMonth).to.equal(returnRequirement2.abstractionPeriodEndMonth)
      expect(result[1].siteDescription).to.equal(returnRequirement2.siteDescription)
      expect(result[1].legacyId).to.equal(returnRequirement2.legacyId)
      expect(result[1].externalId).to.equal(returnRequirement2.externalId)
      expect(result[1].twoPartTariff).to.equal(returnRequirement2.twoPartTariff)
      expect(result[1].returnVersion.endDate).to.equal(returnVersion.endDate)
      expect(result[1].returnVersion.id).to.equal(returnVersion.id)
      expect(result[1].returnVersion.startDate).to.equal(returnVersion.startDate)
      expect(result[1].returnVersion.reason).to.equal(returnVersion.reason)
      expect(result[1].returnVersion.licence.id).to.equal(licence.id)
      expect(result[1].returnVersion.licence.expiredDate).to.equal(licence.expiredDate)
      expect(result[1].returnVersion.licence.lapsedDate).to.equal(licence.lapsedDate)
      expect(result[1].returnVersion.licence.licenceRef).to.equal(licence.licenceRef)
      expect(result[1].returnVersion.licence.revokedDate).to.equal(licence.revokedDate)
      expect(result[1].returnVersion.licence.areacode).to.equal(licence.regions.historicalAreaCode)
      expect(result[1].returnVersion.licence.region.id).to.equal(region.id)
      expect(result[1].returnVersion.licence.region.naldRegionId).to.equal(region.naldRegionId)
      expect(result[1].points[0].description).to.equal(point2.description)
      expect(result[1].points[0].ngr1).to.equal(point2.ngr1)
      expect(result[1].points[0].ngr2).to.equal(point2.ngr2)
      expect(result[1].points[0].ngr3).to.equal(point2.ngr3)
      expect(result[1].points[0].ngr4).to.equal(point2.ngr4)
      expect(result[1].returnRequirementPurposes[0].id).to.equal(returnRequirementPurpose2.id)
      expect(result[1].returnRequirementPurposes[0].returnRequirementId).to.equal(
        returnRequirementPurpose2.returnRequirementId
      )
      expect(result[1].returnRequirementPurposes[0].primaryPurposeId).to.equal(
        returnRequirementPurpose2.primaryPurposeId
      )
      expect(result[1].returnRequirementPurposes[0].secondaryPurposeId).to.equal(
        returnRequirementPurpose2.secondaryPurposeId
      )
      expect(result[1].returnRequirementPurposes[0].purposeId).to.equal(returnRequirementPurpose2.purposeId)
      expect(result[1].returnRequirementPurposes[0].alias).to.equal(returnRequirementPurpose2.alias)
      expect(result[1].returnRequirementPurposes[0].externalId).to.equal(returnRequirementPurpose2.externalId)
      expect(result[1].returnRequirementPurposes[0].primaryPurpose.legacyId).to.equal(primaryPurpose2.legacyId)
      expect(result[1].returnRequirementPurposes[0].primaryPurpose.description).to.equal(primaryPurpose2.description)
      expect(result[1].returnRequirementPurposes[0].secondaryPurpose.legacyId).to.equal(secondaryPurpose2.legacyId)
      expect(result[1].returnRequirementPurposes[0].secondaryPurpose.description).to.equal(
        secondaryPurpose2.description
      )
      expect(result[1].returnRequirementPurposes[0].purpose.legacyId).to.equal(purpose2.legacyId)
      expect(result[1].returnRequirementPurposes[0].purpose.description).to.equal(purpose2.description)
    })
  })

  describe('when summer is false, there is an expired date, one return requirement and a licenceRef provided', () => {
    before(async () => {
      returnCycle = await ReturnCycleHelper.select(0, false)
      expiredDate = new Date(new Date().getFullYear() + 1, 1, 31).toISOString().split('T')[0]
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ expiredDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id
      })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
      allYearReturns.push(returnRequirement.legacyId)
    })

    it('should return one return log payload', async () => {
      const result = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].id).to.equal(returnRequirement.id)
      expect(result[0].returnVersionId).to.equal(returnVersion.id)
      expect(result[0].reportingFrequency).to.equal(returnRequirement.reportingFrequency)
      expect(result[0].summer).to.equal(returnRequirement.summer)
      expect(result[0].upload).to.equal(returnRequirement.upload)
      expect(result[0].abstractionPeriodStartDay).to.equal(returnRequirement.abstractionPeriodStartDay)
      expect(result[0].abstractionPeriodStartMonth).to.equal(returnRequirement.abstractionPeriodStartMonth)
      expect(result[0].abstractionPeriodEndDay).to.equal(returnRequirement.abstractionPeriodEndDay)
      expect(result[0].abstractionPeriodEndMonth).to.equal(returnRequirement.abstractionPeriodEndMonth)
      expect(result[0].siteDescription).to.equal(returnRequirement.siteDescription)
      expect(result[0].legacyId).to.equal(returnRequirement.legacyId)
      expect(result[0].externalId).to.equal(returnRequirement.externalId)
      expect(result[0].twoPartTariff).to.equal(returnRequirement.twoPartTariff)
      expect(result[0].returnVersion.endDate).to.equal(returnVersion.endDate)
      expect(result[0].returnVersion.id).to.equal(returnVersion.id)
      expect(result[0].returnVersion.startDate).to.equal(returnVersion.startDate)
      expect(result[0].returnVersion.reason).to.equal(returnVersion.reason)
      expect(result[0].returnVersion.licence.id).to.equal(licence.id)
      expect(result[0].returnVersion.licence.expiredDate).to.equal(licence.expiredDate)
      expect(result[0].returnVersion.licence.lapsedDate).to.equal(licence.lapsedDate)
      expect(result[0].returnVersion.licence.licenceRef).to.equal(licence.licenceRef)
      expect(result[0].returnVersion.licence.revokedDate).to.equal(licence.revokedDate)
      expect(result[0].returnVersion.licence.areacode).to.equal(licence.regions.historicalAreaCode)
      expect(result[0].returnVersion.licence.region.id).to.equal(region.id)
      expect(result[0].returnVersion.licence.region.naldRegionId).to.equal(region.naldRegionId)
      expect(result[0].points[0].description).to.equal(point.description)
      expect(result[0].points[0].ngr1).to.equal(point.ngr1)
      expect(result[0].points[0].ngr2).to.equal(point.ngr2)
      expect(result[0].points[0].ngr3).to.equal(point.ngr3)
      expect(result[0].points[0].ngr4).to.equal(point.ngr4)
      expect(result[0].returnRequirementPurposes[0].id).to.equal(returnRequirementPurpose.id)
      expect(result[0].returnRequirementPurposes[0].returnRequirementId).to.equal(
        returnRequirementPurpose.returnRequirementId
      )
      expect(result[0].returnRequirementPurposes[0].primaryPurposeId).to.equal(
        returnRequirementPurpose.primaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].secondaryPurposeId).to.equal(
        returnRequirementPurpose.secondaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].purposeId).to.equal(returnRequirementPurpose.purposeId)
      expect(result[0].returnRequirementPurposes[0].alias).to.equal(returnRequirementPurpose.alias)
      expect(result[0].returnRequirementPurposes[0].externalId).to.equal(returnRequirementPurpose.externalId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.legacyId).to.equal(primaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.description).to.equal(primaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.legacyId).to.equal(secondaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.description).to.equal(secondaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].purpose.legacyId).to.equal(purpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].purpose.description).to.equal(purpose.description)
    })
  })

  describe('when summer is false, there is an expired date after the end of the cycle, one return requirement and a licenceRef provided', () => {
    before(async () => {
      returnCycle = await ReturnCycleHelper.select(0, false)
      expiredDate = new Date(new Date().getFullYear() + 1, 3, 31).toISOString().split('T')[0]
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ expiredDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id
      })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
      allYearReturns.push(returnRequirement.legacyId)
    })

    it('should return one return log payload', async () => {
      const result = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].id).to.equal(returnRequirement.id)
      expect(result[0].returnVersionId).to.equal(returnVersion.id)
      expect(result[0].reportingFrequency).to.equal(returnRequirement.reportingFrequency)
      expect(result[0].summer).to.equal(returnRequirement.summer)
      expect(result[0].upload).to.equal(returnRequirement.upload)
      expect(result[0].abstractionPeriodStartDay).to.equal(returnRequirement.abstractionPeriodStartDay)
      expect(result[0].abstractionPeriodStartMonth).to.equal(returnRequirement.abstractionPeriodStartMonth)
      expect(result[0].abstractionPeriodEndDay).to.equal(returnRequirement.abstractionPeriodEndDay)
      expect(result[0].abstractionPeriodEndMonth).to.equal(returnRequirement.abstractionPeriodEndMonth)
      expect(result[0].siteDescription).to.equal(returnRequirement.siteDescription)
      expect(result[0].legacyId).to.equal(returnRequirement.legacyId)
      expect(result[0].externalId).to.equal(returnRequirement.externalId)
      expect(result[0].twoPartTariff).to.equal(returnRequirement.twoPartTariff)
      expect(result[0].returnVersion.endDate).to.equal(returnVersion.endDate)
      expect(result[0].returnVersion.id).to.equal(returnVersion.id)
      expect(result[0].returnVersion.startDate).to.equal(returnVersion.startDate)
      expect(result[0].returnVersion.reason).to.equal(returnVersion.reason)
      expect(result[0].returnVersion.licence.id).to.equal(licence.id)
      expect(result[0].returnVersion.licence.expiredDate).to.equal(licence.expiredDate)
      expect(result[0].returnVersion.licence.lapsedDate).to.equal(licence.lapsedDate)
      expect(result[0].returnVersion.licence.licenceRef).to.equal(licence.licenceRef)
      expect(result[0].returnVersion.licence.revokedDate).to.equal(licence.revokedDate)
      expect(result[0].returnVersion.licence.areacode).to.equal(licence.regions.historicalAreaCode)
      expect(result[0].returnVersion.licence.region.id).to.equal(region.id)
      expect(result[0].returnVersion.licence.region.naldRegionId).to.equal(region.naldRegionId)
      expect(result[0].points[0].description).to.equal(point.description)
      expect(result[0].points[0].ngr1).to.equal(point.ngr1)
      expect(result[0].points[0].ngr2).to.equal(point.ngr2)
      expect(result[0].points[0].ngr3).to.equal(point.ngr3)
      expect(result[0].points[0].ngr4).to.equal(point.ngr4)
      expect(result[0].returnRequirementPurposes[0].id).to.equal(returnRequirementPurpose.id)
      expect(result[0].returnRequirementPurposes[0].returnRequirementId).to.equal(
        returnRequirementPurpose.returnRequirementId
      )
      expect(result[0].returnRequirementPurposes[0].primaryPurposeId).to.equal(
        returnRequirementPurpose.primaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].secondaryPurposeId).to.equal(
        returnRequirementPurpose.secondaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].purposeId).to.equal(returnRequirementPurpose.purposeId)
      expect(result[0].returnRequirementPurposes[0].alias).to.equal(returnRequirementPurpose.alias)
      expect(result[0].returnRequirementPurposes[0].externalId).to.equal(returnRequirementPurpose.externalId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.legacyId).to.equal(primaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.description).to.equal(primaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.legacyId).to.equal(secondaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.description).to.equal(secondaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].purpose.legacyId).to.equal(purpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].purpose.description).to.equal(purpose.description)
    })
  })

  describe('when summer is true, there is a lapsed date, one return requirement and a licenceRef provided', () => {
    before(async () => {
      returnCycle = await ReturnCycleHelper.select(0, true)
      lapsedDate = new Date(new Date().getFullYear() + 1, 8, 31).toISOString().split('T')[0]
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ lapsedDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id,
        summer: true
      })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
      summerReturns.push(returnRequirement.legacyId)
    })

    it('should return one return log payload', async () => {
      const result = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].id).to.equal(returnRequirement.id)
      expect(result[0].returnVersionId).to.equal(returnVersion.id)
      expect(result[0].reportingFrequency).to.equal(returnRequirement.reportingFrequency)
      expect(result[0].summer).to.equal(returnRequirement.summer)
      expect(result[0].upload).to.equal(returnRequirement.upload)
      expect(result[0].abstractionPeriodStartDay).to.equal(returnRequirement.abstractionPeriodStartDay)
      expect(result[0].abstractionPeriodStartMonth).to.equal(returnRequirement.abstractionPeriodStartMonth)
      expect(result[0].abstractionPeriodEndDay).to.equal(returnRequirement.abstractionPeriodEndDay)
      expect(result[0].abstractionPeriodEndMonth).to.equal(returnRequirement.abstractionPeriodEndMonth)
      expect(result[0].siteDescription).to.equal(returnRequirement.siteDescription)
      expect(result[0].legacyId).to.equal(returnRequirement.legacyId)
      expect(result[0].externalId).to.equal(returnRequirement.externalId)
      expect(result[0].twoPartTariff).to.equal(returnRequirement.twoPartTariff)
      expect(result[0].returnVersion.endDate).to.equal(returnVersion.endDate)
      expect(result[0].returnVersion.id).to.equal(returnVersion.id)
      expect(result[0].returnVersion.startDate).to.equal(returnVersion.startDate)
      expect(result[0].returnVersion.reason).to.equal(returnVersion.reason)
      expect(result[0].returnVersion.licence.id).to.equal(licence.id)
      expect(result[0].returnVersion.licence.expiredDate).to.equal(licence.expiredDate)
      expect(result[0].returnVersion.licence.lapsedDate).to.equal(licence.lapsedDate)
      expect(result[0].returnVersion.licence.licenceRef).to.equal(licence.licenceRef)
      expect(result[0].returnVersion.licence.revokedDate).to.equal(licence.revokedDate)
      expect(result[0].returnVersion.licence.areacode).to.equal(licence.regions.historicalAreaCode)
      expect(result[0].returnVersion.licence.region.id).to.equal(region.id)
      expect(result[0].returnVersion.licence.region.naldRegionId).to.equal(region.naldRegionId)
      expect(result[0].points[0].description).to.equal(point.description)
      expect(result[0].points[0].ngr1).to.equal(point.ngr1)
      expect(result[0].points[0].ngr2).to.equal(point.ngr2)
      expect(result[0].points[0].ngr3).to.equal(point.ngr3)
      expect(result[0].points[0].ngr4).to.equal(point.ngr4)
      expect(result[0].returnRequirementPurposes[0].id).to.equal(returnRequirementPurpose.id)
      expect(result[0].returnRequirementPurposes[0].returnRequirementId).to.equal(
        returnRequirementPurpose.returnRequirementId
      )
      expect(result[0].returnRequirementPurposes[0].primaryPurposeId).to.equal(
        returnRequirementPurpose.primaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].secondaryPurposeId).to.equal(
        returnRequirementPurpose.secondaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].purposeId).to.equal(returnRequirementPurpose.purposeId)
      expect(result[0].returnRequirementPurposes[0].alias).to.equal(returnRequirementPurpose.alias)
      expect(result[0].returnRequirementPurposes[0].externalId).to.equal(returnRequirementPurpose.externalId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.legacyId).to.equal(primaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.description).to.equal(primaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.legacyId).to.equal(secondaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.description).to.equal(secondaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].purpose.legacyId).to.equal(purpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].purpose.description).to.equal(purpose.description)
    })
  })

  describe('when summer is true, there is a revoked date that is after the cycle, one return requirement and a licenceRef provided', () => {
    before(async () => {
      returnCycle = await ReturnCycleHelper.select(0, true)
      revokedDate = new Date(new Date().getFullYear() + 1, 10, 31).toISOString().split('T')[0]
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ revokedDate, regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id,
        summer: true
      })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
      summerReturns.push(returnRequirement.legacyId)
    })

    it('should return one return log payload', async () => {
      const result = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].id).to.equal(returnRequirement.id)
      expect(result[0].returnVersionId).to.equal(returnVersion.id)
      expect(result[0].reportingFrequency).to.equal(returnRequirement.reportingFrequency)
      expect(result[0].summer).to.equal(returnRequirement.summer)
      expect(result[0].upload).to.equal(returnRequirement.upload)
      expect(result[0].abstractionPeriodStartDay).to.equal(returnRequirement.abstractionPeriodStartDay)
      expect(result[0].abstractionPeriodStartMonth).to.equal(returnRequirement.abstractionPeriodStartMonth)
      expect(result[0].abstractionPeriodEndDay).to.equal(returnRequirement.abstractionPeriodEndDay)
      expect(result[0].abstractionPeriodEndMonth).to.equal(returnRequirement.abstractionPeriodEndMonth)
      expect(result[0].siteDescription).to.equal(returnRequirement.siteDescription)
      expect(result[0].legacyId).to.equal(returnRequirement.legacyId)
      expect(result[0].externalId).to.equal(returnRequirement.externalId)
      expect(result[0].twoPartTariff).to.equal(returnRequirement.twoPartTariff)
      expect(result[0].returnVersion.endDate).to.equal(returnVersion.endDate)
      expect(result[0].returnVersion.id).to.equal(returnVersion.id)
      expect(result[0].returnVersion.startDate).to.equal(returnVersion.startDate)
      expect(result[0].returnVersion.reason).to.equal(returnVersion.reason)
      expect(result[0].returnVersion.licence.id).to.equal(licence.id)
      expect(result[0].returnVersion.licence.expiredDate).to.equal(licence.expiredDate)
      expect(result[0].returnVersion.licence.lapsedDate).to.equal(licence.lapsedDate)
      expect(result[0].returnVersion.licence.licenceRef).to.equal(licence.licenceRef)
      expect(result[0].returnVersion.licence.revokedDate).to.equal(licence.revokedDate)
      expect(result[0].returnVersion.licence.areacode).to.equal(licence.regions.historicalAreaCode)
      expect(result[0].returnVersion.licence.region.id).to.equal(region.id)
      expect(result[0].returnVersion.licence.region.naldRegionId).to.equal(region.naldRegionId)
      expect(result[0].points[0].description).to.equal(point.description)
      expect(result[0].points[0].ngr1).to.equal(point.ngr1)
      expect(result[0].points[0].ngr2).to.equal(point.ngr2)
      expect(result[0].points[0].ngr3).to.equal(point.ngr3)
      expect(result[0].points[0].ngr4).to.equal(point.ngr4)
      expect(result[0].returnRequirementPurposes[0].id).to.equal(returnRequirementPurpose.id)
      expect(result[0].returnRequirementPurposes[0].returnRequirementId).to.equal(
        returnRequirementPurpose.returnRequirementId
      )
      expect(result[0].returnRequirementPurposes[0].primaryPurposeId).to.equal(
        returnRequirementPurpose.primaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].secondaryPurposeId).to.equal(
        returnRequirementPurpose.secondaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].purposeId).to.equal(returnRequirementPurpose.purposeId)
      expect(result[0].returnRequirementPurposes[0].alias).to.equal(returnRequirementPurpose.alias)
      expect(result[0].returnRequirementPurposes[0].externalId).to.equal(returnRequirementPurpose.externalId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.legacyId).to.equal(primaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.description).to.equal(primaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.legacyId).to.equal(secondaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.description).to.equal(secondaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].purpose.legacyId).to.equal(purpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].purpose.description).to.equal(purpose.description)
    })
  })

  describe('when summer is true, the return version start date is after the cycle start date, one return requirement and a licenceRef provided', () => {
    before(async () => {
      returnCycle = await ReturnCycleHelper.select(0, true)
      startDate = formatDateObjectToISO(new Date(`${returnCycle.startDate.getFullYear()}-11-01`))
      primaryPurpose = PrimaryPurposeHelper.select()
      purpose = PurposeHelper.select()
      secondaryPurpose = SecondaryPurposeHelper.select()
      region = RegionHelper.select()
      licence = await LicenceHelper.add({ regionId: region.id })
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id, startDate })
      returnRequirement = await ReturnRequirementHelper.add({
        regionId: region.naldRegionId,
        returnVersionId: returnVersion.id,
        summer: true
      })
      point = await PointHelper.add()
      await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId: returnRequirement.id })
      returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        primaryPurposeId: primaryPurpose.id,
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id,
        secondaryPurposeId: secondaryPurpose.id
      })
      summerReturns.push(returnRequirement.legacyId)
    })

    it('should return one return log payload', async () => {
      const result = await FetchReturnRequirementsService.go(returnCycle, licence.licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].id).to.equal(returnRequirement.id)
      expect(result[0].returnVersionId).to.equal(returnVersion.id)
      expect(result[0].reportingFrequency).to.equal(returnRequirement.reportingFrequency)
      expect(result[0].summer).to.equal(returnRequirement.summer)
      expect(result[0].upload).to.equal(returnRequirement.upload)
      expect(result[0].abstractionPeriodStartDay).to.equal(returnRequirement.abstractionPeriodStartDay)
      expect(result[0].abstractionPeriodStartMonth).to.equal(returnRequirement.abstractionPeriodStartMonth)
      expect(result[0].abstractionPeriodEndDay).to.equal(returnRequirement.abstractionPeriodEndDay)
      expect(result[0].abstractionPeriodEndMonth).to.equal(returnRequirement.abstractionPeriodEndMonth)
      expect(result[0].siteDescription).to.equal(returnRequirement.siteDescription)
      expect(result[0].legacyId).to.equal(returnRequirement.legacyId)
      expect(result[0].externalId).to.equal(returnRequirement.externalId)
      expect(result[0].twoPartTariff).to.equal(returnRequirement.twoPartTariff)
      expect(result[0].returnVersion.endDate).to.equal(returnVersion.endDate)
      expect(result[0].returnVersion.id).to.equal(returnVersion.id)
      expect(result[0].returnVersion.startDate).to.equal(returnVersion.startDate)
      expect(result[0].returnVersion.reason).to.equal(returnVersion.reason)
      expect(result[0].returnVersion.licence.id).to.equal(licence.id)
      expect(result[0].returnVersion.licence.expiredDate).to.equal(licence.expiredDate)
      expect(result[0].returnVersion.licence.lapsedDate).to.equal(licence.lapsedDate)
      expect(result[0].returnVersion.licence.licenceRef).to.equal(licence.licenceRef)
      expect(result[0].returnVersion.licence.revokedDate).to.equal(licence.revokedDate)
      expect(result[0].returnVersion.licence.areacode).to.equal(licence.regions.historicalAreaCode)
      expect(result[0].returnVersion.licence.region.id).to.equal(region.id)
      expect(result[0].returnVersion.licence.region.naldRegionId).to.equal(region.naldRegionId)
      expect(result[0].points[0].description).to.equal(point.description)
      expect(result[0].points[0].ngr1).to.equal(point.ngr1)
      expect(result[0].points[0].ngr2).to.equal(point.ngr2)
      expect(result[0].points[0].ngr3).to.equal(point.ngr3)
      expect(result[0].points[0].ngr4).to.equal(point.ngr4)
      expect(result[0].returnRequirementPurposes[0].id).to.equal(returnRequirementPurpose.id)
      expect(result[0].returnRequirementPurposes[0].returnRequirementId).to.equal(
        returnRequirementPurpose.returnRequirementId
      )
      expect(result[0].returnRequirementPurposes[0].primaryPurposeId).to.equal(
        returnRequirementPurpose.primaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].secondaryPurposeId).to.equal(
        returnRequirementPurpose.secondaryPurposeId
      )
      expect(result[0].returnRequirementPurposes[0].purposeId).to.equal(returnRequirementPurpose.purposeId)
      expect(result[0].returnRequirementPurposes[0].alias).to.equal(returnRequirementPurpose.alias)
      expect(result[0].returnRequirementPurposes[0].externalId).to.equal(returnRequirementPurpose.externalId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.legacyId).to.equal(primaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].primaryPurpose.description).to.equal(primaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.legacyId).to.equal(secondaryPurpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].secondaryPurpose.description).to.equal(secondaryPurpose.description)
      expect(result[0].returnRequirementPurposes[0].purpose.legacyId).to.equal(purpose.legacyId)
      expect(result[0].returnRequirementPurposes[0].purpose.description).to.equal(purpose.description)
    })
  })

  describe('when summer is false, and no licenceReference is provided it should return all the return requirements that are eligible', () => {
    it('should return five return log payloads', async () => {
      returnCycle = await ReturnCycleHelper.select(0, false)

      const results = await FetchReturnRequirementsService.go(returnCycle)

      const returnRequirementExternalId = results.map((returnLog) => {
        return returnLog.legacyId
      })

      expect(
        allYearReturns.every((result) => {
          return returnRequirementExternalId.includes(result)
        })
      ).to.equal(true)
    })
  })

  describe('when summer is true, and no licenceReference is provided it should return all the return requirements that are eligible', () => {
    it('should return five return log payloads', async () => {
      returnCycle = await ReturnCycleHelper.select(0, true)

      const results = await FetchReturnRequirementsService.go(returnCycle)

      const returnRequirementExternalId = results.map((returnLog) => {
        return returnLog.legacyId
      })

      expect(
        summerReturns.every((result) => {
          return returnRequirementExternalId.includes(result)
        })
      ).to.equal(true)
    })
  })
})
