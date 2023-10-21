'use strict';

// Test framework dependencies
const { describe, it, beforeEach } = require('@jest/globals');
const sinon = require('sinon');

// Test helpers
const ChangeReasonHelper = require('../../../support/helpers/water/change-reason.helper.js');
const ChargeCategoryHelper = require('../../../support/helpers/water/charge-category.helper.js');
const ChargeElementHelper = require('../../../support/helpers/water/charge-element.helper.js');
const ChargeReferenceHelper = require('../../../support/helpers/water/charge-reference.helper.js');
const ChargeVersionHelper = require('../../../support/helpers/water/charge-version.helper.js');
const WorkflowHelper = require('../../../support/helpers/water/workflow.helper.js');
const DatabaseHelper = require('../../../support/helpers/database.helper.js');
const LicenceHelper = require('../../../support/helpers/water/licence.helper.js');
const RegionHelper = require('../../../support/helpers/water/region.helper.js');

// Thing under test
const FetchChargeVersionsService = require('../../../../app/services/billing/supplementary/fetch-charge-versions.service.js');

describe('Fetch Charge Versions service', () => {
  const licenceDefaults = LicenceHelper.defaults();

  let testRecords;
  let billingPeriod;
  let region;
  let regionId;

  beforeEach(async () => {
    await DatabaseHelper.clean();

    region = await RegionHelper.add();
    regionId = region.regionId;
  });

  describe('when there are charge versions that should be considered for the next supplementary billing', () => {
    let chargeCategory;
    let chargeReference2023;
    let chargeReference2023And24;
    let chargeReference2024;
    let chargeElement2023;
    let chargeElement2023And24;
    let chargeElement2024;
    let changeReason;
    let licence;

    beforeEach(async () => {
      billingPeriod = {
        startDate: new Date('2023-04-01'),
        endDate: new Date('2024-03-31')
      };
      licence = await LicenceHelper.add({
        regionId,
        isWaterUndertaker: true,
        includeInSrocSupplementaryBilling: true,
        includeInSupplementaryBilling: 'yes'
      });
      changeReason = await ChangeReasonHelper.add({ triggersMinimumCharge: true });

      const { licenceId, licenceRef } = licence;
      const { changeReasonId } = changeReason;
      const invoiceAccountId = '77483323-daec-443e-912f-b87e1e9d0721';

      // This creates a 'current' SROC charge version which covers only FYE 2024
      const sroc2024ChargeVersion = await ChargeVersionHelper.add(
        { startDate: new Date('2023-11-01'), changeReasonId, invoiceAccountId, licenceId, licenceRef }
      );

      // This creates a 'current' SROC charge version which covers both FYE 2023 and 2024
      const sroc2023And24ChargeVersion = await ChargeVersionHelper.add(
        { endDate: new Date('2023-10-31'), changeReasonId, invoiceAccountId, licenceId, licenceRef }
      );

      // This creates a 'current' SROC charge version which covers only FYE 2023
      const sroc2023ChargeVersion = await ChargeVersionHelper.add(
        { endDate: new Date('2022-10-31'), changeReasonId, invoiceAccountId, licenceId, licenceRef }
      );

      // This creates a 'superseded' SROC charge version
      const srocSupersededChargeVersion = await ChargeVersionHelper.add(
        { changeReasonId, status: 'superseded', invoiceAccountId, licenceId, licenceRef }
      );

      // This creates an ALCS (presroc) charge version
      const alcsChargeVersion = await ChargeVersionHelper.add(
        { scheme: 'alcs', invoiceAccountId, licenceId, licenceRef }
      );

      testRecords = [
        sroc2024ChargeVersion,
        sroc2023And24ChargeVersion,
        sroc2023ChargeVersion,
        srocSupersededChargeVersion,
        alcsChargeVersion
      ];

      // We test that related data is returned in the results. So, we create and link it to the srocChargeVersion
      // ready for testing
      chargeCategory = await ChargeCategoryHelper.add();

      chargeReference2024 = await ChargeReferenceHelper.add({
        chargeVersionId: sroc2024ChargeVersion.chargeVersionId,
        billingChargeCategoryId: chargeCategory.billingChargeCategoryId
      });

      chargeElement2024 = await ChargeElementHelper.add({
        chargeElementId: chargeReference2024.chargeElementId
      });

      chargeReference2023And24 = await ChargeReferenceHelper.add({
        chargeVersionId: sroc2023And24ChargeVersion.chargeVersionId,
        billingChargeCategoryId: chargeCategory.billingChargeCategoryId
      });

      chargeElement2023And24 = await ChargeElementHelper.add({
        chargeElementId: chargeReference2023And24.chargeElementId
      });

      chargeReference2023 = await ChargeReferenceHelper.add({
        chargeVersionId: sroc2023ChargeVersion.chargeVersionId,
        billingChargeCategoryId: chargeCategory.billingChargeCategoryId
      });

      chargeElement2023 = await ChargeElementHelper.add({
        chargeElementId: chargeReference2023.chargeElementId
      });
    });

    describe('including those linked to soft-deleted workflow records', () => {
      beforeEach(async () => {
        await WorkflowHelper.add({ licenceId: licence.licenceId, dateDeleted: new Date('2022-04-01') });
      });

      it('returns the SROC charge versions that are applicable', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod);

        expect(result.chargeVersions).toHaveLength(4);

        const chargeVersionIds = result.chargeVersions.map((chargeVersion) => {
          return chargeVersion.chargeVersionId;
        });

        expect(chargeVersionIds).toContain(testRecords[0].chargeVersionId);
        expect(chargeVersionIds).toContain(testRecords[1].chargeVersionId);
        expect(chargeVersionIds).toContain(testRecords[2].chargeVersionId);
        expect(chargeVersionIds).toContain(testRecords[3].chargeVersionId);
      });

      it('returns a unique list of licenceIds from SROC charge versions that are applicable', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod);

        expect(result.licenceIdsForPeriod).toHaveLength(1);
        expect(result.licenceIdsForPeriod[0]).toBe(licence.licenceId);
      });
    });

    it("returns both 'current' and 'superseded' SROC charge version that are applicable", async () => {
      const result = await FetchChargeVersionsService.go(regionId, billingPeriod);

      expect(result.chargeVersions).toHaveLength(4);

      const chargeVersionIds = result.chargeVersions.map((chargeVersion) => {
        return chargeVersion.chargeVersionId;
      });

      expect(chargeVersionIds).toContain(testRecords[0].chargeVersionId);
      expect(chargeVersionIds).toContain(testRecords[1].chargeVersionId);
      expect(chargeVersionIds).toContain(testRecords[2].chargeVersionId);
      expect(chargeVersionIds).toContain(testRecords[3].chargeVersionId);
    });

    it('includes the related licence and region', async () => {
      const result = await FetchChargeVersionsService.go(regionId, billingPeriod);

      expect(result.chargeVersions[0].licence.licenceRef).toBe(licence.licenceRef);
      expect(result.chargeVersions[0].licence.isWaterUndertaker).toBe(true);
      expect(result.chargeVersions[0].licence.historicalAreaCode).toBe(licenceDefaults.regions.historicalAreaCode);
      expect(result.chargeVersions[0].licence.regionalChargeArea).toBe(licenceDefaults.regions.regionalChargeArea);
      expect(result.chargeVersions[0].licence.region.regionId).toBe(regionId);
      expect(result.chargeVersions[0].licence.region.chargeRegionId).toBe(region.chargeRegionId);
    });

    it('includes the related change reason', async () => {
      const result = await FetchChargeVersionsService.go(regionId, billingPeriod);

      expect(result.chargeVersions[0].changeReason.triggersMinimumCharge).toBe(changeReason.triggersMinimumCharge);
    });

    it('includes the related charge references, charge category, and charge elements', async () => {
      const result = await FetchChargeVersionsService.go(regionId, billingPeriod);

      const expectedResult2024 = {
        chargeElementId: chargeReference2024.chargeElementId,
        source: chargeReference2024.source,
        loss: chargeReference2024.loss,
        volume: chargeReference2024.volume,
        adjustments: chargeReference2024.adjustments,
        additionalCharges: chargeReference2024.additionalCharges,
        description: chargeReference2024.description,
        chargeCategory: {
          reference: chargeCategory.reference,
          shortDescription: chargeCategory.shortDescription,
        },
        chargeElements: [{
          chargePurposeId: chargeElement2024.chargePurposeId,
          abstractionPeriodStartDay: chargeElement2024.abstractionPeriodStartDay,
          abstractionPeriodStartMonth: chargeElement2024.abstractionPeriodStartMonth,
          abstractionPeriodEndDay: chargeElement2024.abstractionPeriodEndDay,
          abstractionPeriodEndMonth: chargeElement2024.abstractionPeriodEndMonth,
        }],
      };

      const expectedResult2023And24 = {
        chargeElementId: chargeReference2023And24.chargeElementId,
        source: chargeReference2023And24.source,
        loss: chargeReference2023And24.loss,
        volume: chargeReference2023And24.volume,
        adjustments: chargeReference2023And24.adjustments,
        additionalCharges: chargeReference2023And24.additionalCharges,
        description: chargeReference2023And24.description,
        chargeCategory: {
          reference: chargeCategory.reference,
          shortDescription: chargeCategory.shortDescription,
        },
        chargeElements: [{
          chargePurposeId: chargeElement2023And24.chargePurposeId,
          abstractionPeriodStartDay: chargeElement2023And24.abstractionPeriodStartDay,
          abstractionPeriodStartMonth: chargeElement2023And24.abstractionPeriodStartMonth,
          abstractionPeriodEndDay: chargeElement2023And24.abstractionPeriodEndDay,
          abstractionPeriodEndMonth: chargeElement2023And24.abstractionPeriodEndMonth,
        }],
      };

      const expectedResult2023 = {
        chargeElementId: chargeReference2023.chargeElementId,
        source: chargeReference2023.source,
        loss: chargeReference2023.loss,
        volume: chargeReference2023.volume,
        adjustments: chargeReference2023.adjustments,
        additionalCharges: chargeReference2023.additionalCharges,
        description: chargeReference2023.description,
        chargeCategory: {
          reference: chargeCategory.reference,
          shortDescription: chargeCategory.shortDescription,
        },
        chargeElements: [{
          chargePurposeId: chargeElement2023.chargePurposeId,
          abstractionPeriodStartDay: chargeElement2023.abstractionPeriodStartDay,
          abstractionPeriodStartMonth: chargeElement2023.abstractionPeriodStartMonth,
          abstractionPeriodEndDay: chargeElement2023.abstractionPeriodEndDay,
          abstractionPeriodEndMonth: chargeElement2023.abstractionPeriodEndMonth,
        }],
      };

      expect(result.chargeVersions[0].chargeReferences[0]).toStrictEqual(expectedResult2024);
      expect(result.chargeVersions[1].chargeReferences[0]).toStrictEqual(expectedResult2023And24);
      expect(result.chargeVersions[2].chargeReferences[0]).toStrictEqual(expectedResult2023);
    });
  });

  describe('when there are no charge version that should be considered for the next supplementary billing', () => {
    describe("because none of them are linked to a licence flagged 'includeInSrocSupplementaryBilling'", () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        };

        // This creates an SROC charge version linked to a licence. But the licence won't be marked for supplementary
        // billing
        const srocChargeVersion = await ChargeVersionHelper.add();
        testRecords = [srocChargeVersion];
      });

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod);

        expect(result.chargeVersions).toStrictEqual([]);
        expect(result.licenceIdsForPeriod).toStrictEqual([]);
      });
    });

    describe("because all the applicable charge versions have a 'draft' status", () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: aew Date('2023-03-31')
        };

        const { licenceId } = await LicenceHelper.add({
          regionId,
          isWaterUndertaker: true,
          includeInSrocSupplementaryBilling: true
        });

        const srocDraftChargeVersion = await ChargeVersionHelper.add({ status: 'draft', licenceId });
        testRecords = [srocDraftChargeVersion];
      });

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod);

        expect(result.chargeVersions).toStrictEqual([]);
        expect(result.licenceIdsForPeriod).toStrictEqual([]);
      });
    });

    describe("because all of them are for the 'alcs' (presroc) scheme", () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        };

        const { licenceId } = await LicenceHelper.add({
          regionId,
          includeInSupplementaryBilling: true
        });

        // This creates an ALCS (presroc) charge version linked to a licence marked for supplementary billing
        const alcsChargeVersion = await ChargeVersionHelper.add({ scheme: 'alcs', licenceId });
        testRecords = [alcsChargeVersion];
      });

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod);

        expect(result.chargeVersions).toStrictEqual([]);
        expect(result.licenceIdsForPeriod).toStrictEqual([]);
      });
    });

    describe('because none of them have an `invoiceAccountId`', () => {
      let licenceId;
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        };

        const licence = await LicenceHelper.add({
          regionId,
          includeInSrocSupplementaryBilling: true
        });

        licenceId = licence.licenceId;

        // This creates a charge version with no `invoiceAccountId`
        const nullInvoiceAccountIdChargeVersion = await ChargeVersionHelper
          .add({ invoiceAccountId: null, licenceId });
        testRecords = [nullInvoiceAccountIdChargeVersion];
      });

      it('returns the licenceId but no applicable charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod);

        expect(result.chargeVersions).toStrictEqual([]);
        expect(result.licenceIdsForPeriod).toHaveLength(1);
        expect(result.licenceIdsForPeriod[0]).toBe(licenceId);
      });
    });

    describe('because they all have start dates after the billing period', () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        };

        const { licenceId } = await LicenceHelper.add({
          regionId,
          includeInSrocSupplementaryBilling: true
        });

        // This creates an SROC charge version with a start date after the billing period. This will be picked in
        // next year's bill runs
        const srocChargeVersion = await ChargeVersionHelper.add(
          { startDate: new Date('2023-04-01'), licenceId }
        );
        testRecords = [srocChargeVersion];
      });

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod);

        expect(result.chargeVersions).toStrictEqual([]);
        expect(result.licenceIdsForPeriod).toStrictEqual([]);
      });
    });

    describe('because the licences flagged for supplementary billing are linked to a different region', () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        };

        const { licenceId } = await LicenceHelper.add({
          regionId: 'e117b501-e3c1-4337-ad35-21c60ed9ad73',
          includeInSrocSupplementaryBilling: true
        });

        // This creates an SROC charge version linked to a licence with a different region than selected
        const otherRegionChargeVersion = await ChargeVersionHelper.add({ licenceId });
        testRecords = [otherRegionChargeVersion];
      });

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod);

        expect(result.chargeVersions).toStrictEqual([]);
        expect(result.licenceIdsForPeriod).toStrictEqual([]);
      });
    });

    describe('because they are all linked to licences in workflow', () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        };

        const { licenceId } = await LicenceHelper.add({
          regionId,
          includeInSrocSupplementaryBilling: true
        });

        const chargeVersion = await ChargeVersionHelper.add({ licenceId });
        await WorkflowHelper.add({ licenceId });

        testRecords = [chargeVersion];
      });

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod);

        expect(result.chargeVersions).toStrictEqual([]);
        expect(result.licenceIdsForPeriod).toStrictEqual([]);
      });
    });
  });
});
