// Test framework dependencies
import * as BillHelper from '../../../support/helpers/bill.helper.js'
import * as BillLicenceHelper from '../../../support/helpers/bill-licence.helper.js'
import * as BillRunHelper from '../../../support/helpers/bill-run.helper.js'
import * as BillRunChargeVersionYearHelper from '../../../support/helpers/bill-run-charge-version-year.helper.js'
import * as BillRunVolumeHelper from '../../../support/helpers/bill-run-volume.helper.js'
import * as ReviewChargeElementHelper from '../../../support/helpers/review-charge-element.helper.js'
import * as ReviewChargeElementReturnHelper from '../../../support/helpers/review-charge-element-return.helper.js'
import * as ReviewChargeReferenceHelper from '../../../support/helpers/review-charge-reference.helper.js'
import * as ReviewChargeVersionHelper from '../../../support/helpers/review-charge-version.helper.js'
import * as ReviewLicenceHelper from '../../../support/helpers/review-licence.helper.js'
import * as ReviewReturnHelper from '../../../support/helpers/review-return.helper.js'
import * as TransactionHelper from '../../../support/helpers/transaction.helper.js'

// Things we need to stub
import BillLicenceModel from '../../../../app/models/bill-licence.model.js'
import * as ChargingModuleDeleteBillRunRequest from '../../../../app/requests/charging-module/delete-bill-run.request.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import ReviewLicenceModel from '../../../../app/models/review-licence.model.js'

// Thing under test
import DeleteBillBunService from '../../../../app/services/bill-runs/cancel/delete-bill-run.service.js'

describe('Bill Runs - Delete Bill Run service', () => {
  let billRun
  let chargingModuleDeleteBillRunRequestStub
  let notifierStub

  beforeEach(() => {
    chargingModuleDeleteBillRunRequestStub = vi
      .spyOn(ChargingModuleDeleteBillRunRequest, 'send')
      .mockImplementation(() => {})

    // The service depends on GlobalNotifier to have been set. This happens in
    // app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered. As we're not
    // creating an instance of Hapi server in this test we recreate the condition by setting it directly with our
    // own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when the bill run exists', () => {
    let bill
    let billLicence
    let billRunChargeVersionYear
    let billRunVolume
    let seededBillRun
    let transaction

    describe('and no errors are thrown', () => {
      beforeEach(async () => {
        seededBillRun = await BillRunHelper.add({ status: 'cancel' })

        billRun = { id: seededBillRun.id, externalId: seededBillRun.externalId, status: seededBillRun.status }

        // Add billing data
        billRunChargeVersionYear = await BillRunChargeVersionYearHelper.add({ billRunId: billRun.id })
        billRunVolume = await BillRunVolumeHelper.add({ billRunId: billRun.id })
        bill = await BillHelper.add({ billRunId: billRun.id })

        billLicence = await BillLicenceHelper.add({ billId: bill.id })
        transaction = await TransactionHelper.add({ billLicenceId: billLicence.id })

        chargingModuleDeleteBillRunRequestStub.mockResolvedValue()
      })

      it('sends a request to the Charging Module API to delete its copy', async () => {
        await DeleteBillBunService(billRun)

        expect(chargingModuleDeleteBillRunRequestStub).toHaveBeenCalled()
      })

      it('deletes any billing data data', async () => {
        await DeleteBillBunService(billRun)

        const billRunChargeVersionYearCount = await billRunChargeVersionYear.$query().select('id').resultSize()
        const billRunVolumeCount = await billRunVolume.$query().select('id').resultSize()
        const transactionCount = await transaction.$query().select('id').resultSize()
        const billLicenceCount = await billLicence.$query().select('id').resultSize()
        const billCount = await bill.$query().select('id').resultSize()
        const billRunCount = await seededBillRun.$query().select('id').resultSize()

        expect(billRunChargeVersionYearCount).toEqual(0)
        expect(billRunVolumeCount).toEqual(0)
        expect(transactionCount).toEqual(0)
        expect(billLicenceCount).toEqual(0)
        expect(billCount).toEqual(0)
        expect(billRunCount).toEqual(0)
      })

      it('logs a "complete" message, the bill run passed in, and the time taken in milliseconds and seconds', async () => {
        await DeleteBillBunService(billRun)

        const logDataArg = notifierStub.omg.mock.calls[0][1]

        expect(notifierStub.omg).toHaveBeenCalledWith('Delete bill run complete', expect.any(Object))
        expect(logDataArg.timeTakenMs).toBeDefined()
        expect(logDataArg.timeTakenSs).toBeDefined()
        expect(logDataArg.billRun).toEqual(billRun)
      })

      describe('and the bill run has two-part tariff review data', () => {
        let reviewChargeElement
        let reviewChargeElementReturn
        let reviewChargeReference
        let reviewChargeVersion
        let reviewLicence
        let reviewReturn

        beforeEach(async () => {
          // Add two-part tariff review data
          reviewLicence = await ReviewLicenceHelper.add({ billRunId: billRun.id })
          reviewReturn = await ReviewReturnHelper.add({ reviewLicenceId: reviewLicence.id })
          reviewChargeVersion = await ReviewChargeVersionHelper.add({ reviewLicenceId: reviewLicence.id })
          reviewChargeReference = await ReviewChargeReferenceHelper.add({
            reviewChargeVersionId: reviewChargeVersion.id
          })
          reviewChargeElement = await ReviewChargeElementHelper.add({
            reviewChargeReferenceId: reviewChargeReference.id
          })
          reviewChargeElementReturn = await ReviewChargeElementReturnHelper.add({
            reviewChargeElementId: reviewChargeElement.id,
            reviewReturnId: reviewReturn.id
          })
        })

        it('deletes any two-part tariff review data', async () => {
          await DeleteBillBunService(billRun)

          const reviewChargeElementCount = await reviewChargeElement.$query().select('id').resultSize()
          const reviewChargeElementReturnCount = await reviewChargeElementReturn.$query().select('id').resultSize()
          const reviewChargeReferenceCount = await reviewChargeReference.$query().select('id').resultSize()
          const reviewChargeVersionCount = await reviewChargeVersion.$query().select('id').resultSize()
          const reviewLicenceCount = await reviewLicence.$query().select('id').resultSize()
          const reviewReturnCount = await reviewReturn.$query().select('id').resultSize()

          expect(reviewChargeElementCount).toEqual(0)
          expect(reviewChargeElementReturnCount).toEqual(0)
          expect(reviewChargeReferenceCount).toEqual(0)
          expect(reviewChargeVersionCount).toEqual(0)
          expect(reviewLicenceCount).toEqual(0)
          expect(reviewReturnCount).toEqual(0)
        })
      })
    })

    describe('but an error is thrown', () => {
      describe('outside of the delete calls', () => {
        beforeEach(() => {
          billRun = null
        })

        it('does not throw an error', async () => {
          await DeleteBillBunService(billRun)
        })

        it('logs the error', async () => {
          await DeleteBillBunService(billRun)

          const errorLogArgs = notifierStub.omfg.mock.calls[0]

          expect(notifierStub.omfg).toHaveBeenCalledWith(
            'Delete bill run failed',
            expect.any(Object),
            expect.any(Error)
          )
          expect(errorLogArgs[1]).toEqual(billRun)
          expect(errorLogArgs[2]).toBeInstanceOf(Error)
        })
      })

      describe('when making the request to the Charging Module API', () => {
        beforeEach(async () => {
          billRun = _billRun()

          chargingModuleDeleteBillRunRequestStub.mockRejectedValue(new Error())
        })

        it('does not throw an error', async () => {
          await DeleteBillBunService(billRun)
        })

        it('logs the error', async () => {
          await DeleteBillBunService(billRun)

          const errorLogArgs = notifierStub.omfg.mock.calls[0]

          expect(notifierStub.omfg).toHaveBeenCalledWith(
            'Delete bill run failed',
            expect.any(Object),
            expect.any(Error)
          )
          expect(errorLogArgs[1]).toEqual(billRun)
          expect(errorLogArgs[2]).toBeInstanceOf(Error)
        })
      })

      describe('when deleting the billing data', () => {
        beforeEach(async () => {
          billRun = _billRun()

          chargingModuleDeleteBillRunRequestStub.mockResolvedValue()
          vi.spyOn(BillLicenceModel, 'query').mockReturnValue({
            delete: vi.fn().mockReturnThis(),
            whereExists: vi.fn().mockRejectedValue(new Error())
          })
        })

        it('does not throw an error', async () => {
          await DeleteBillBunService(billRun)
        })

        it('logs the error', async () => {
          await DeleteBillBunService(billRun)

          const errorLogArgs = notifierStub.omfg.mock.calls[0]

          expect(notifierStub.omfg).toHaveBeenCalledWith(
            'Delete bill run failed',
            expect.any(Object),
            expect.any(Error)
          )
          expect(errorLogArgs[1]).toEqual(billRun)
          expect(errorLogArgs[2]).toBeInstanceOf(Error)
        })
      })

      describe('when deleting the two-part tariff review data', () => {
        beforeEach(async () => {
          billRun = _billRun()

          chargingModuleDeleteBillRunRequestStub.mockResolvedValue()
          vi.spyOn(ReviewLicenceModel, 'query').mockReturnValue({
            delete: vi.fn().mockReturnThis(),
            where: vi.fn().mockRejectedValue(new Error())
          })
        })

        it('does not throw an error', async () => {
          await DeleteBillBunService(billRun)
        })

        it('logs the error', async () => {
          await DeleteBillBunService(billRun)

          const errorLogArgs = notifierStub.omfg.mock.calls[0]

          expect(notifierStub.omfg).toHaveBeenCalledWith(
            'Delete bill run failed',
            expect.any(Object),
            expect.any(Error)
          )
          expect(errorLogArgs[1]).toEqual(billRun)
          expect(errorLogArgs[2]).toBeInstanceOf(Error)
        })
      })
    })
  })

  describe('when the bill run does not exist', () => {
    beforeEach(() => {
      billRun = _billRun()
    })

    it('still sends a request to the Charging Module API', async () => {
      await DeleteBillBunService(billRun)

      expect(chargingModuleDeleteBillRunRequestStub).toHaveBeenCalled()
    })

    it('still logs a "complete" message, the bill run passed in, and the time taken in milliseconds and seconds', async () => {
      await DeleteBillBunService(billRun)

      const logDataArg = notifierStub.omg.mock.calls[0][1]

      expect(notifierStub.omg).toHaveBeenCalledWith('Delete bill run complete', expect.any(Object))
      expect(logDataArg.timeTakenMs).toBeDefined()
      expect(logDataArg.timeTakenSs).toBeDefined()
      expect(logDataArg.billRun).toEqual(billRun)
    })

    it('does not throw an error', async () => {
      await DeleteBillBunService(billRun)
    })
  })
})

function _billRun() {
  return {
    id: 'dafe5048-24b1-485a-8289-2e584bb7ba68',
    externalId: 'ef6a17f2-412f-4502-a73d-b74c8b92ff19',
    status: 'cancel'
  }
}
