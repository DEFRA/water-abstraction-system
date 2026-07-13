// Test framework dependencies

// Test helpers
import * as BillingAccountHelper from '../../../support/helpers/billing-account.helper.js'
import BillRunError from '../../../../app/errors/bill-run.error.js'
import * as BillRunHelper from '../../../support/helpers/bill-run.helper.js'
import BillRunModel from '../../../../app/models/bill-run.model.js'
import * as ChangeReasonHelper from '../../../support/helpers/change-reason.helper.js'
import * as ChargeCategoryHelper from '../../../support/helpers/charge-category.helper.js'
import * as ChargeElementHelper from '../../../support/helpers/charge-element.helper.js'
import * as ChargeReferenceHelper from '../../../support/helpers/charge-reference.helper.js'
import * as ChargeVersionHelper from '../../../support/helpers/charge-version.helper.js'
import FetchChargeVersionsService from '../../../../app/services/bill-runs/supplementary/fetch-charge-versions.service.js'
import * as LicenceHelper from '../../../support/helpers/licence.helper.js'
import * as RegionHelper from '../../../support/helpers/region.helper.js'

// Things we need to stub
import * as ChargingModuleGenerateBillRunRequest from '../../../../app/requests/charging-module/generate-bill-run.request.js'
import * as FetchPreviousTransactionsService from '../../../../app/services/bill-runs/fetch-previous-transactions.service.js'
import * as GenerateTransactionsService from '../../../../app/services/bill-runs/generate-transactions.service.js'
import * as SendTransactionsService from '../../../../app/services/bill-runs/send-transactions.service.js'

// Thing under test
import ProcessBillingPeriodService from '../../../../app/services/bill-runs/supplementary/process-billing-period.service.js'

const CHANGE_NEW_AGREEMENT_INDEX = 2
const REGION_SOUTH_WEST_INDEX = 4

describe('Bill Runs - Supplementary - Process Billing Period service', () => {
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

    vi.spyOn(FetchPreviousTransactionsService, 'default').mockResolvedValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the service is called', () => {
    describe('and there are no charge versions to process', () => {
      beforeEach(() => {
        chargeVersions = []
      })

      it('returns false (bill run is empty)', async () => {
        const result = await ProcessBillingPeriodService(billRun, billingPeriod, chargeVersions)

        expect(result).toBe(false)
      })
    })

    describe('and there are charge versions to process', () => {
      describe('but none of them are billable', () => {
        describe('because the billable days calculated as 0', () => {
          beforeEach(async () => {
            const { id: chargeVersionId } = await ChargeVersionHelper.add({
              changeReasonId: changeReason.id,
              billingAccountId: billingAccount.id,
              startDate: new Date(2022, 7, 1, 9),
              licenceId: licence.id
            })
            const { id: chargeReferenceId } = await ChargeReferenceHelper.add({
              chargeCategoryId: chargeCategory.id,
              chargeVersionId
            })

            await ChargeElementHelper.add({
              chargeReferenceId,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4,
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 5
            })

            const chargeVersionData = await FetchChargeVersionsService(licence.regionId, billingPeriod)

            chargeVersions = chargeVersionData.chargeVersions
          })

          describe('and there are no previous billed transactions', () => {
            it('returns false (bill run is empty)', async () => {
              const result = await ProcessBillingPeriodService(billRun, billingPeriod, chargeVersions)

              expect(result).toBe(false)
            })
          })
        })

        describe('because the charge version status is "superseded"', () => {
          describe('and there are no previously billed transactions', () => {
            beforeEach(async () => {
              const { id: chargeVersionId } = await ChargeVersionHelper.add({
                changeReasonId: changeReason.id,
                billingAccountId: billingAccount.id,
                startDate: new Date(2022, 7, 1, 9),
                licenceId: licence.id,
                status: 'superseded'
              })
              const { chargeElementId } = await ChargeReferenceHelper.add({
                chargeCategoryId: chargeCategory.id,
                chargeVersionId
              })

              await ChargeElementHelper.add({
                chargeElementId,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 4,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3
              })

              const chargeVersionData = await FetchChargeVersionsService(licence.regionId, billingPeriod)

              chargeVersions = chargeVersionData.chargeVersions
            })

            it('returns false (bill run is empty)', async () => {
              const result = await ProcessBillingPeriodService(billRun, billingPeriod, chargeVersions)

              expect(result).toBe(false)
            })
          })
        })
      })

      describe('and they are billable', () => {
        beforeEach(async () => {
          const { id: chargeVersionId } = await ChargeVersionHelper.add({
            changeReasonId: changeReason.id,
            billingAccountId: billingAccount.id,
            startDate: new Date(2022, 7, 1, 9),
            licenceId: licence.id
          })
          const { id: chargeReferenceId } = await ChargeReferenceHelper.add({
            chargeCategoryId: chargeCategory.id,
            chargeVersionId
          })

          await ChargeElementHelper.add({
            chargeReferenceId,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3
          })

          const chargeVersionData = await FetchChargeVersionsService(licence.regionId, billingPeriod)

          chargeVersions = chargeVersionData.chargeVersions

          const sentTransactions = [
            {
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
              chargeCategoryDescription:
                'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model',
              supportedSource: false,
              supportedSourceName: null,
              waterCompanyCharge: true,
              winterOnly: false,
              waterUndertaker: false,
              externalId: '7e752fa6-a19c-4779-b28c-6e536f028795',
              purposes: [{}]
            }
          ]

          vi.spyOn(SendTransactionsService, 'default').mockResolvedValue(sentTransactions)
          vi.spyOn(ChargingModuleGenerateBillRunRequest, 'send').mockResolvedValue({
            succeeded: true,
            response: {}
          })
        })

        it('returns true (bill run is not empty)', async () => {
          const result = await ProcessBillingPeriodService(billRun, billingPeriod, chargeVersions)

          expect(result).toBe(true)
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
      const { id: chargeReferenceId } = await ChargeReferenceHelper.add({
        chargeCategoryId: chargeCategory.id,
        chargeVersionId
      })

      await ChargeElementHelper.add({ chargeReferenceId })

      const chargeVersionData = await FetchChargeVersionsService(licence.regionId, billingPeriod)

      chargeVersions = chargeVersionData.chargeVersions
    })

    describe('because generating the calculated transactions fails', () => {
      beforeEach(async () => {
        vi.spyOn(GenerateTransactionsService, 'default').mockImplementation(() => {
          throw new Error()
        })
      })

      it('throws a BillRunError with the correct code', async () => {
        const error = await ProcessBillingPeriodService(billRun, billingPeriod, chargeVersions).catch((e) => {
          return e
        })

        expect(error).toBeInstanceOf(BillRunError)
        expect(error.code).toEqual(BillRunModel.errorCodes.failedToPrepareTransactions)
      })
    })

    describe('because sending the transactions fails', () => {
      beforeEach(async () => {
        const thrownError = new BillRunError(new Error(), BillRunModel.errorCodes.failedToCreateCharge)

        vi.spyOn(SendTransactionsService, 'default').mockRejectedValue(thrownError)
      })

      it('throws a BillRunError with the correct code', async () => {
        const error = await ProcessBillingPeriodService(billRun, billingPeriod, chargeVersions).catch((e) => {
          return e
        })

        expect(error).toBeInstanceOf(BillRunError)
        expect(error.code).toEqual(BillRunModel.errorCodes.failedToCreateCharge)
      })
    })
  })
})
