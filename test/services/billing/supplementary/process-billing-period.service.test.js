'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunError = require('../../../../app/errors/bill-run.error.js')
const BillRunHelper = require('../../../support/helpers/water/bill-run.helper.js')
const BillRunModel = require('../../../../app/models/water/bill-run.model.js')
const ChangeReasonHelper = require('../../../support/helpers/water/change-reason.helper.js')
const ChargeCategoryHelper = require('../../../support/helpers/water/charge-category.helper.js')
const ChargeElementHelper = require('../../../support/helpers/water/charge-element.helper.js')
const ChargeInformationHelper = require('../../../support/helpers/water/charge-information.helper.js')
const ChargePurposeHelper = require('../../../support/helpers/water/charge-purpose.helper.js')
const FetchChargeInformationsService = require('../../../../app/services/billing/supplementary/fetch-charge-informations.service.js')
const InvoiceAccountHelper = require('../../../support/helpers/crm-v2/invoice-account.helper.js')
const LicenceHelper = require('../../../support/helpers/water/licence.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const RegionHelper = require('../../../support/helpers/water/region.helper.js')

// Things we need to stub
const ChargingModuleGenerateService = require('../../../../app/services/charging-module/generate-bill-run.service.js')
const GenerateTransactionsService = require('../../../../app/services/billing/supplementary/generate-transactions.service.js')
const SendTransactionsService = require('../../../../app/services/billing/supplementary/send-transactions.service.js')

// Thing under test
const ProcessBillingPeriodService = require('../../../../app/services/billing/supplementary/process-billing-period.service.js')

describe('Process billing period service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  let chargeCategory
  let billRun
  let changeReason
  let chargeInformations
  let invoiceAccount
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const { regionId } = await RegionHelper.add()
    licence = await LicenceHelper.add({ includeInSrocSupplementaryBilling: true, regionId })
    changeReason = await ChangeReasonHelper.add()
    invoiceAccount = await InvoiceAccountHelper.add()
    chargeCategory = await ChargeCategoryHelper.add()

    billRun = await BillRunHelper.add({ regionId })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    describe('and there are no charge informations to process', () => {
      beforeEach(() => {
        chargeInformations = []
      })

      it('returns false (bill run is empty)', async () => {
        const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, chargeInformations)

        expect(result).to.be.false()
      })
    })

    describe('and there are charge informations to process', () => {
      describe('and they are billable', () => {
        beforeEach(async () => {
          const { chargeVersionId } = await ChargeInformationHelper.add(
            {
              changeReasonId: changeReason.changeReasonId,
              invoiceAccountId: invoiceAccount.invoiceAccountId,
              startDate: new Date(2022, 7, 1, 9),
              licenceId: licence.licenceId
            }
          )
          const { chargeElementId } = await ChargeElementHelper.add(
            { billingChargeCategoryId: chargeCategory.billingChargeCategoryId, chargeVersionId }
          )
          await ChargePurposeHelper.add({
            chargeElementId,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3
          })

          const chargeInformationData = await FetchChargeInformationsService.go(licence.regionId, billingPeriod)
          chargeInformations = chargeInformationData.chargeInformations

          const sentTransactions = [{
            billingTransactionId: '9b092372-1a26-436a-bf1f-b5eb3f9aca44',
            billingInvoiceLicenceId: '594fc25e-99c1-440a-8b88-b507ee17738a',
            chargeElementId: '32058a19-4813-4ee7-808b-a0559deb8469',
            startDate: new Date('2022-04-01'),
            endDate: new Date('2022-10-31'),
            source: 'non-tidal',
            season: 'all year',
            loss: 'low',
            isCredit: false,
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
            isNewLicence: false,
            isTwoPartSecondPartCharge: false,
            scheme: 'sroc',
            aggregateFactor: 0.562114443,
            adjustmentFactor: 1,
            chargeCategoryCode: '4.4.5',
            chargeCategoryDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model',
            isSupportedSource: false,
            supportedSourceName: null,
            isWaterCompanyCharge: true,
            isWinterOnly: false,
            isWaterUndertaker: false,
            externalId: '7e752fa6-a19c-4779-b28c-6e536f028795'
          }]

          Sinon.stub(SendTransactionsService, 'go').resolves(sentTransactions)
          Sinon.stub(ChargingModuleGenerateService, 'go').resolves({
            succeeded: true,
            response: {}
          })
        })

        it('returns true (bill run is not empty)', async () => {
          const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, chargeInformations)

          expect(result).to.be.true()
        })
      })

      describe('but none of them are billable', () => {
        describe('because the billable days calculated as 0', () => {
          beforeEach(async () => {
            const { chargeVersionId } = await ChargeInformationHelper.add(
              {
                changeReasonId: changeReason.changeReasonId,
                invoiceAccountId: invoiceAccount.invoiceAccountId,
                startDate: new Date(2022, 7, 1, 9),
                licenceId: licence.licenceId
              }
            )
            const { chargeElementId } = await ChargeElementHelper.add(
              { billingChargeCategoryId: chargeCategory.billingChargeCategoryId, chargeVersionId }
            )
            await ChargePurposeHelper.add({
              chargeElementId,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4,
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 5
            })

            const chargeVersionData = await FetchChargeInformationsService.go(licence.regionId, billingPeriod)
            chargeInformations = chargeVersionData.chargeInformations
          })

          describe('and there are no previous billed transactions', () => {
            it('returns false (bill run is empty)', async () => {
              const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, chargeInformations)

              expect(result).to.be.false()
            })
          })
        })

        describe('because the charge version status is `superseded`', () => {
          describe('and there are no previously billed transactions', () => {
            beforeEach(async () => {
              const { chargeVersionId } = await ChargeInformationHelper.add(
                {
                  changeReasonId: changeReason.changeReasonId,
                  invoiceAccountId: invoiceAccount.invoiceAccountId,
                  startDate: new Date(2022, 7, 1, 9),
                  licenceId: licence.licenceId,
                  status: 'superseded'
                }
              )
              const { chargeElementId } = await ChargeElementHelper.add(
                { billingChargeCategoryId: chargeCategory.billingChargeCategoryId, chargeVersionId }
              )
              await ChargePurposeHelper.add({
                chargeElementId,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 4,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3
              })

              const chargeVersionData = await FetchChargeInformationsService.go(licence.regionId, billingPeriod)
              chargeInformations = chargeVersionData.chargeInformations
            })

            it('returns false (bill run is empty)', async () => {
              const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, chargeInformations)

              expect(result).to.be.false()
            })
          })
        })
      })
    })
  })

  describe('when the service errors', () => {
    beforeEach(async () => {
      const { chargeVersionId } = await ChargeInformationHelper.add({
        changeReasonId: changeReason.changeReasonId,
        invoiceAccountId: invoiceAccount.invoiceAccountId,
        licenceId: licence.licenceId
      })
      const { chargeElementId } = await ChargeElementHelper.add(
        { billingChargeCategoryId: chargeCategory.billingChargeCategoryId, chargeVersionId }
      )
      await ChargePurposeHelper.add({ chargeElementId })

      const chargeInformationData = await FetchChargeInformationsService.go(licence.regionId, billingPeriod)
      chargeInformations = chargeInformationData.chargeInformations
    })

    describe('because generating the calculated transactions fails', () => {
      beforeEach(async () => {
        Sinon.stub(GenerateTransactionsService, 'go').throws()
      })

      it('throws a BillRunError with the correct code', async () => {
        const error = await expect(ProcessBillingPeriodService.go(billRun, billingPeriod, chargeInformations))
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
        const error = await expect(ProcessBillingPeriodService.go(billRun, billingPeriod, chargeInformations))
          .to
          .reject()

        expect(error).to.be.an.instanceOf(BillRunError)
        expect(error.code).to.equal(BillRunModel.errorCodes.failedToCreateCharge)
      })
    })
  })
})
