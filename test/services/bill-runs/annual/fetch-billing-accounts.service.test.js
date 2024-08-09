'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingAccountHelper = require('../../../support/helpers/billing-account.helper.js')
const BillingAccountModel = require('../../../../app/models/billing-account.model.js')
const ChangeReasonHelper = require('../../../support/helpers/change-reason.helper.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const WorkflowHelper = require('../../../support/helpers/workflow.helper.js')
const DatabaseSupport = require('../../../support/database.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')

// Thing under test
const FetchBillingAccountsService = require('../../../../app/services/bill-runs/annual/fetch-billing-accounts.service.js')

describe('Fetch Billing Accounts service', () => {
  const billingPeriod = determineCurrentFinancialYear()

  let billingAccount
  let billingAccountId
  let licence
  let licenceId
  let region
  let regionId

  beforeEach(async () => {
    await DatabaseSupport.clean()

    region = RegionHelper.select()
    regionId = region.id

    licence = await LicenceHelper.add({ regionId })
    licenceId = licence.id

    billingAccount = await BillingAccountHelper.add()
    billingAccountId = billingAccount.id
  })

  describe('when there are billing accounts that should be considered for annual billing', () => {
    let changeReason
    let chargeCategory
    let chargeElement
    let chargeReference
    let chargeVersion

    beforeEach(async () => {
      changeReason = await ChangeReasonHelper.add({ triggersMinimumCharge: true })

      const { id: licenceId, licenceRef } = licence
      const { id: changeReasonId } = changeReason

      chargeVersion = await ChargeVersionHelper.add(
        { startDate: new Date('2023-11-01'), changeReasonId, billingAccountId, licenceId, licenceRef }
      )
      const { id: chargeVersionId } = chargeVersion

      chargeCategory = await ChargeCategoryHelper.add()
      const { id: chargeCategoryId } = chargeCategory

      chargeReference = await ChargeReferenceHelper.add({ chargeVersionId, chargeCategoryId })
      const { id: chargeReferenceId } = chargeReference

      chargeElement = await ChargeElementHelper.add({ chargeReferenceId })
    })

    it('returns the applicable billing accounts', async () => {
      const results = await FetchBillingAccountsService.go(regionId, billingPeriod)

      expect(results).to.have.length(1)

      expect(results[0]).to.be.instanceOf(BillingAccountModel)
      expect(results[0].id).to.equal(billingAccountId)
      expect(results[0].accountNumber).to.equal(billingAccount.accountNumber)
    })

    describe('that have applicable related charge versions', () => {
      it('includes the charge versions in each result', async () => {
        const results = await FetchBillingAccountsService.go(regionId, billingPeriod)

        const { chargeVersions } = results[0]

        expect(chargeVersions[0].id).to.equal(chargeVersion.id)
        expect(chargeVersions[0].scheme).to.equal('sroc')
        expect(chargeVersions[0].startDate).to.equal(new Date('2023-11-01'))
        expect(chargeVersions[0].endDate).to.be.null()
        expect(chargeVersions[0].billingAccountId).to.equal(billingAccountId)
        expect(chargeVersions[0].status).to.equal('current')
      })

      it('includes the licence and region in each result', async () => {
        const results = await FetchBillingAccountsService.go(regionId, billingPeriod)

        const { licence } = results[0].chargeVersions[0]

        expect(licence.id).to.equal(licence.id)
        expect(licence.licenceRef).to.equal(licence.licenceRef)
        expect(licence.waterUndertaker).to.equal(false)
        expect(licence.historicalAreaCode).to.equal('SAAR')
        expect(licence.regionalChargeArea).to.equal('Southern')
        expect(licence.region.id).to.equal(regionId)
        expect(licence.region.chargeRegionId).to.equal(region.chargeRegionId)
      })

      it('includes the change reason in each result', async () => {
        const results = await FetchBillingAccountsService.go(regionId, billingPeriod)

        const { changeReason } = results[0].chargeVersions[0]

        expect(changeReason.id).to.equal(changeReason.id)
        expect(changeReason.triggersMinimumCharge).to.equal(changeReason.triggersMinimumCharge)
      })

      it('includes the charge references, charge category and charge elements in each result', async () => {
        const results = await FetchBillingAccountsService.go(regionId, billingPeriod)

        const { chargeReferences } = results[0].chargeVersions[0]

        expect(chargeReferences).to.have.length(1)

        expect(chargeReferences[0]).to.equal({
          id: chargeReference.id,
          source: 'non-tidal',
          loss: 'low',
          volume: 6.819,
          adjustments: {
            s126: null, s127: false, s130: false, charge: null, winter: false, aggregate: '0.562114443'
          },
          additionalCharges: { isSupplyPublicWater: true },
          description: 'Mineral washing',
          chargeCategory: {
            id: chargeCategory.id,
            reference: chargeCategory.reference,
            shortDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model'
          },
          chargeElements: [{
            id: chargeElement.id,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3
          }]
        })
      })
    })

    describe('that have inapplicable related charge versions', () => {
      beforeEach(async () => {
        const licenceInWorkflow = await LicenceHelper.add({ regionId })
        const { id: licenceInWorkflowId, licenceRef } = licenceInWorkflow

        await ChargeVersionHelper.add({ billingAccountId, licenceId: licenceInWorkflowId, licenceRef })
        await WorkflowHelper.add({ licenceId: licenceInWorkflowId })
      })

      it('excludes the charge versions in each result', async () => {
        const results = await FetchBillingAccountsService.go(regionId, billingPeriod)

        const { chargeVersions } = results[0]

        expect(chargeVersions.length).to.equal(1)
        expect(chargeVersions[0].id).to.equal(chargeVersion.id)
      })
    })
  })

  describe('when there are no billing accounts that should be considered for the annual bill run', () => {
    describe('because all their charge versions do not have a status of "current"', () => {
      beforeEach(async () => {
        await ChargeVersionHelper.add({ status: 'draft', billingAccountId, licenceId })
      })

      it('returns empty results', async () => {
        const results = await FetchBillingAccountsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because all their charge versions are for the "alcs" (presroc) scheme', () => {
      beforeEach(async () => {
        await ChargeVersionHelper.add({ scheme: 'alcs', billingAccountId, licenceId })
      })

      it('returns empty results', async () => {
        const results = await FetchBillingAccountsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because all their charge versions have start dates after the billing period', () => {
      beforeEach(async () => {
        const financialStartYear = billingPeriod.endDate.getFullYear()

        // This creates an charge version with a start date after the billing period
        await ChargeVersionHelper.add(
          { startDate: new Date(financialStartYear, 8, 15), billingAccountId, licenceId }
        )
      })

      it('returns empty results', async () => {
        const results = await FetchBillingAccountsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because all their charge versions have end dates before the billing period', () => {
      beforeEach(async () => {
        const financialEndYear = billingPeriod.startDate.getFullYear()

        // This creates an charge version with a end date before the billing period starts
        await ChargeVersionHelper.add(
          { endDate: new Date(financialEndYear, 2, 31), billingAccountId, licenceId }
        )
      })

      it('returns empty results', async () => {
        const results = await FetchBillingAccountsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because they are all linked to licences in a different region', () => {
      beforeEach(async () => {
        const { id: licenceId } = await LicenceHelper.add({ regionId: 'e117b501-e3c1-4337-ad35-21c60ed9ad73' })

        // This creates an charge version linked to a licence with an different region than selected
        await ChargeVersionHelper.add({ billingAccountId, licenceId })
      })

      it('returns empty results', async () => {
        const results = await FetchBillingAccountsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because they are all linked to licences that ended before the billing period', () => {
      beforeEach(async () => {
        const { id: licenceId } = await LicenceHelper.add({ revokedDate: new Date('2023-02-01') })

        // This creates a charge version linked to a licence that ends before the billing period
        await ChargeVersionHelper.add({ billingAccountId, licenceId })
      })

      it('returns empty results', async () => {
        const results = await FetchBillingAccountsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because they are all linked to licences in workflow', () => {
      beforeEach(async () => {
        await ChargeVersionHelper.add({ billingAccountId, licenceId })
        await WorkflowHelper.add({ licenceId })
      })

      it('returns empty results', async () => {
        const results = await FetchBillingAccountsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })
  })
})
