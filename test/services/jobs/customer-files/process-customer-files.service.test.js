// Test helpers
import BillingAccountHelper from '../../../support/helpers/billing-account.helper.js'
import BillingAccountModel from '../../../../app/models/billing-account.model.js'
import http2 from 'node:http2'

// Things we need to stub
import * as ChargingModuleViewCustomerFilesRequest from '../../../../app/requests/charging-module/view-customer-files.request.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'

// Thing under test
import ProcessCustomerFilesService from '../../../../app/services/jobs/customer-files/process-customer-files.service.js'

const { HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_OK } = http2.constants

describe('Jobs - Customer Files - Process Customer Files service', () => {
  const days = 7

  let accountExportedOnce
  let accountExportedTwice
  let accountPreviouslyProcessed
  let billRunQueryStub
  let notifierStub

  beforeEach(async () => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when the Charging Module API response has customer files', () => {
    beforeEach(async () => {
      accountExportedOnce = await BillingAccountHelper.add()
      accountExportedTwice = await BillingAccountHelper.add()
      accountPreviouslyProcessed = await BillingAccountHelper.add({
        lastTransactionFile: 'nalac50001',
        lastTransactionFileCreatedAt: new Date('2025-08-10T12:34:56.789Z')
      })

      vi.spyOn(ChargingModuleViewCustomerFilesRequest, 'send').mockResolvedValue({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.1'
          },
          statusCode: HTTP_STATUS_OK,
          body: [
            {
              id: '9523ff61-bd21-4800-aa7d-d97aa6c923aa',
              fileReference: 'nalac50001',
              status: 'exported',
              exportedAt: '2025-08-10T12:34:56.789Z',
              exportedCustomers: [
                accountExportedOnce.accountNumber,
                accountExportedTwice.accountNumber,
                accountPreviouslyProcessed.accountNumber
              ]
            },
            {
              id: 'aa271bc5-0e36-4aeb-b636-64d95482825f',
              fileReference: 'nalac50002',
              status: 'exported',
              exportedAt: '2025-08-11T13:57:24.680Z',
              exportedCustomers: [accountExportedTwice.accountNumber]
            }
          ]
        }
      })
    })

    it('updates the billing accounts as expected', async () => {
      await ProcessCustomerFilesService(days)

      const refreshedAccountExportedOnce = await accountExportedOnce.$query()
      const refreshedAccountExportedTwice = await accountExportedTwice.$query()
      const refreshedAccountPreviouslyProcessed = await accountPreviouslyProcessed.$query()

      // Confirm the account was updated with the details from the only 'customer file' it appeared in
      expect(refreshedAccountExportedOnce.lastTransactionFile).toEqual('nalac50001')
      expect(refreshedAccountExportedOnce.lastTransactionFileCreatedAt).toEqual(new Date('2025-08-10T12:34:56.789Z'))
      expect(refreshedAccountExportedOnce.updatedAt.getTime()).toBeGreaterThan(accountExportedOnce.updatedAt.getTime())

      // Confirm the account was updated with the details from the last 'customer file' it appeared in
      expect(refreshedAccountExportedTwice.lastTransactionFile).toEqual('nalac50002')
      expect(refreshedAccountExportedTwice.lastTransactionFileCreatedAt).toEqual(new Date('2025-08-11T13:57:24.680Z'))
      expect(refreshedAccountExportedTwice.updatedAt.getTime()).toBeGreaterThan(
        accountExportedTwice.updatedAt.getTime()
      )

      // Confirm the account was not updated as it has already been processed
      expect(refreshedAccountPreviouslyProcessed.lastTransactionFile).toEqual('nalac50001')
      expect(refreshedAccountPreviouslyProcessed.lastTransactionFileCreatedAt).toEqual(
        new Date('2025-08-10T12:34:56.789Z')
      )
      expect(refreshedAccountPreviouslyProcessed.updatedAt).toEqual(accountPreviouslyProcessed.updatedAt)
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessCustomerFilesService(days)

      const logDataArg = notifierStub.omg.mock.calls[0][1]

      expect(notifierStub.omg).toHaveBeenCalledWith('Customer files job complete', expect.any(Object))
      expect(logDataArg.timeTakenMs).toBeDefined()
      expect(logDataArg.timeTakenSs).toBeDefined()
      expect(logDataArg.count).toEqual(3)
    })
  })

  describe('when the Charging Module API response is empty', () => {
    beforeEach(() => {
      vi.spyOn(ChargingModuleViewCustomerFilesRequest, 'send').mockResolvedValue({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.1'
          },
          statusCode: HTTP_STATUS_OK,
          body: []
        }
      })

      billRunQueryStub = vi.spyOn(BillingAccountModel, 'query').mockReturnValue({
        patch: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        whereNot: vi.fn().mockResolvedValue()
      })
    })

    it('updates no billing account records', async () => {
      await ProcessCustomerFilesService(days)

      expect(billRunQueryStub).not.toHaveBeenCalled()
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessCustomerFilesService(days)

      const logDataArg = notifierStub.omg.mock.calls[0][1]

      expect(notifierStub.omg).toHaveBeenCalledWith('Customer files job complete', expect.any(Object))
      expect(logDataArg.timeTakenMs).toBeDefined()
      expect(logDataArg.timeTakenSs).toBeDefined()
      expect(logDataArg.count).toEqual(0)
    })
  })

  describe('when the Charging Module API request fails', () => {
    beforeEach(() => {
      vi.spyOn(ChargingModuleViewCustomerFilesRequest, 'send').mockResolvedValue({
        succeeded: false,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.1'
          },
          statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
          body: []
        }
      })
    })

    it('records the error by calling "omfg()"', async () => {
      await ProcessCustomerFilesService()

      const args = notifierStub.omfg.mock.calls[0]

      expect(args[0]).toEqual('Customer files job failed')
      expect(args[1]).toBeNull()
      expect(args[2]).toBeInstanceOf(Error)
    })

    it('notifies the team by calling "redAlert()"', async () => {
      await ProcessCustomerFilesService()

      const args = notifierStub.redAlert.mock.calls[0]

      expect(args[0]).toEqual('Customer files job failed')
    })

    it('does not throw an error', async () => {
      await ProcessCustomerFilesService()
    })
  })
})
