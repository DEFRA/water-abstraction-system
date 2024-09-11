'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingAccountHelper = require('../../../support/helpers/billing-account.helper.js')
const BillRunError = require('../../../../app/errors/bill-run.error.js')
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const ChangeReasonHelper = require('../../../support/helpers/change-reason.helper.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const FetchChargeVersionsService = require('../../../../app/services/bill-runs/supplementary/fetch-charge-versions.service.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Things we need to stub
const ChargingModuleGenerateBillRunRequest = require('../../../../app/requests/charging-module/generate-bill-run.request.js')
const GenerateTransactionsService = require('../../../../app/services/bill-runs/generate-transactions.service.js')
const SendTransactionsService = require('../../../../app/services/bill-runs/send-transactions.service.js')

// Thing under test
const ProcessBillingPeriodService = require('../../../../app/services/bill-runs/supplementary/process-billing-period.service.js')

const CHANGE_NEW_AGREEMENT_INDEX = 2
const REGION_SOUTH_WEST_INDEX = 4

describe('Supplementary Process billing period service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  let billRun
  let billingAccount
  let chargeCategory
  let changeReason
  let chargeVersions
  let licence
  let region

  beforeEach(async () => {
    region = RegionHelper.select(REGION_SOUTH_WEST_INDEX)

    licence = await LicenceHelper.add({ includeInSrocBilling: true, regionId: region.id })
    changeReason = ChangeReasonHelper.select(CHANGE_NEW_AGREEMENT_INDEX)
    billingAccount = await BillingAccountHelper.add()
    chargeCategory = ChargeCategoryHelper.select()

    billRun = await BillRunHelper.add({ regionId: region.id })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    describe('and there are no charge versions to process', () => {
      beforeEach(() => {
        chargeVersions = []
      })

      it('returns false (bill run is empty)', async () => {
        const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, chargeVersions)

        expect(result).to.be.false()
      })
    })

    describe('and there are charge versions to process', () => {
      describe('but none of them are billable', () => {
        describe('because the billable days calculated as 0', () => {
          beforeEach(async () => {
            const { id: chargeVersionId } = await ChargeVersionHelper.add(
              {
                changeReasonId: changeReason.id,
                billingAccountId: billingAccount.id,
                startDate: new Date(2022, 7, 1, 9),
                licenceId: licence.id
              }
            )
            const { id: chargeReferenceId } = await ChargeReferenceHelper.add(
              { chargeCategoryId: chargeCategory.id, chargeVersionId }
            )

            await ChargeElementHelper.add({
              chargeReferenceId,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4,
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 5
            })

            const chargeVersionData = await FetchChargeVersionsService.go(licence.regionId, billingPeriod)

            chargeVersions = chargeVersionData.chargeVersions
          })

          describe('and there are no previous billed transactions', () => {
            it('returns false (bill run is empty)', async () => {
              const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, chargeVersions)

              expect(result).to.be.false()
            })
          })
        })

        describe('because the charge version status is "superseded"', () => {
          describe('and there are no previously billed transactions', () => {
            beforeEach(async () => {
              const { id: chargeVersionId } = await ChargeVersionHelper.add(
                {
                  changeReasonId: changeReason.id,
                  billingAccountId: billingAccount.id,
                  startDate: new Date(2022, 7, 1, 9),
                  licenceId: licence.id,
                  status: 'superseded'
                }
              )
              const { chargeElementId } = await ChargeReferenceHelper.add(
                { chargeCategoryId: chargeCategory.id, chargeVersionId }
              )

              await ChargeElementHelper.add({
                chargeElementId,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 4,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3
              })

              const chargeVersionData = await FetchChargeVersionsService.go(licence.regionId, billingPeriod)

              chargeVersions = chargeVersionData.chargeVersions
            })

            it('returns false (bill run is empty)', async () => {
              const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, chargeVersions)

              expect(result).to.be.false()
            })
          })
        })
      })

      describe('and they are billable', () => {
        beforeEach(async () => {
          const { id: chargeVersionId } = await ChargeVersionHelper.add(
            {
              changeReasonId: changeReason.id,
              billingAccountId: billingAccount.id,
              startDate: new Date(2022, 7, 1, 9),
              licenceId: licence.id
            }
          )
          const { id: chargeReferenceId } = await ChargeReferenceHelper.add(
            { chargeCategoryId: chargeCategory.id, chargeVersionId }
          )

          await ChargeElementHelper.add({
            chargeReferenceId,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3
          })

          const chargeVersionData = await FetchChargeVersionsService.go(licence.regionId, billingPeriod)

          chargeVersions = chargeVersionData.chargeVersions

          const sentTransactions = [{
            id: '9b092372-1a26-436a-bf1f-b5eb3f9aca44',
            billLicenceId: '594fc25e-99c1-440a-8b88-b507ee17738a',
            chargeReferenceId: '32058a19-4813-4ee7-808b-a0559deb8469',
            startDate: new Date('2022-04-01'),
            endDate: new Date('2022-10-31'),
            source: 'non-tidal',
            season: 'all year',
            loss: 'low',
            credit: false,
            chargeType: 'standard',
            authorisedQuantity: 6.82,
            billableQuantity: 6.82,
            authorisedDays: 365,
            billableDays: 214,
            status: 'charge_created',
            description: 'Water abstraction charge: Mineral washing',
            volume: 6.82,
            section126Factor: 1,
            section127Agreement: false,
            section130Agreement: false,
            newLicence: false,
            secondPartCharge: false,
            scheme: 'sroc',
            aggregateFactor: 0.562114443,
            adjustmentFactor: 1,
            chargeCategoryCode: '4.4.5',
            chargeCategoryDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model',
            supportedSource: false,
            supportedSourceName: null,
            waterCompanyCharge: true,
            winterOnly: false,
            waterUndertaker: false,
            externalId: '7e752fa6-a19c-4779-b28c-6e536f028795',
            purposes: [{}]
          }]

          Sinon.stub(SendTransactionsService, 'go').resolves(sentTransactions)
          Sinon.stub(ChargingModuleGenerateBillRunRequest, 'send').resolves({
            succeeded: true,
            response: {}
          })
        })

        it('returns true (bill run is not empty)', async () => {
          const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, chargeVersions)

          expect(result).to.be.true()
        })
      })
    })
  })

  describe('when the service errors', () => {
    beforeEach(async () => {
      const { id: chargeVersionId } = await ChargeVersionHelper.add({
        changeReasonId: changeReason.id,
        billingAccountId: billingAccount.id,
        licenceId: licence.id
      })
      const { id: chargeReferenceId } = await ChargeReferenceHelper.add(
        { chargeCategoryId: chargeCategory.id, chargeVersionId }
      )

      await ChargeElementHelper.add({ chargeReferenceId })

      const chargeVersionData = await FetchChargeVersionsService.go(licence.regionId, billingPeriod)

      chargeVersions = chargeVersionData.chargeVersions
    })

    describe('because generating the calculated transactions fails', () => {
      beforeEach(async () => {
        Sinon.stub(GenerateTransactionsService, 'go').throws()
      })

      it('throws a BillRunError with the correct code', async () => {
        const error = await expect(ProcessBillingPeriodService.go(billRun, billingPeriod, chargeVersions))
          .to
          .reject()

        expect(error).to.be.an.instanceOf(BillRunError)
        expect(error.code).to.equal(BillRunModel.errorCodes.failedToPrepareTransactions)
      })
    })

    describe('because sending the transactions fails', () => {
      beforeEach(async () => {
        const thrownError = new BillRunError(new Error(), BillRunModel.errorCodes.failedToCreateCharge)

        Sinon.stub(SendTransactionsService, 'go').rejects(thrownError)
      })

      it('throws a BillRunError with the correct code', async () => {
        const error = await expect(ProcessBillingPeriodService.go(billRun, billingPeriod, chargeVersions))
          .to
          .reject()

        expect(error).to.be.an.instanceOf(BillRunError)
        expect(error.code).to.equal(BillRunModel.errorCodes.failedToCreateCharge)
      })
    })
  })
})
