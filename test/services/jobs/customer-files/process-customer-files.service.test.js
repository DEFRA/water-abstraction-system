'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountHelper = require('../../../support/helpers/billing-account.helper.js')
const BillingAccountModel = require('../../../../app/models/billing-account.model.js')

// Things we need to stub
const ChargingModuleViewCustomerFilesRequest = require('../../../../app/requests/charging-module/view-customer-files.request.js')

// Thing under test
const ProcessCustomerFilesService = require('../../../../app/services/jobs/customer-files/process-customer-files.service.js')

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
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the Charging Module API response has customer files', () => {
    beforeEach(async () => {
      accountExportedOnce = await BillingAccountHelper.add()
      accountExportedTwice = await BillingAccountHelper.add()
      accountPreviouslyProcessed = await BillingAccountHelper.add({
        lastTransactionFile: 'nalac50001',
        lastTransactionFileCreatedAt: new Date('2025-08-10T12:34:56.789Z')
      })

      Sinon.stub(ChargingModuleViewCustomerFilesRequest, 'send').resolves({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.1'
          },
          statusCode: 200,
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
      await ProcessCustomerFilesService.go(days)

      const refreshedAccountExportedOnce = await accountExportedOnce.$query()
      const refreshedAccountExportedTwice = await accountExportedTwice.$query()
      const refreshedAccountPreviouslyProcessed = await accountPreviouslyProcessed.$query()

      // Confirm the account was updated with the details from the only 'customer file' it appeared in
      expect(refreshedAccountExportedOnce.lastTransactionFile).to.equal('nalac50001')
      expect(refreshedAccountExportedOnce.lastTransactionFileCreatedAt).to.equal(new Date('2025-08-10T12:34:56.789Z'))
      expect(refreshedAccountExportedOnce.updatedAt).to.be.greaterThan(accountExportedOnce.updatedAt)

      // Confirm the account was updated with the details from the last 'customer file' it appeared in
      expect(refreshedAccountExportedTwice.lastTransactionFile).to.equal('nalac50002')
      expect(refreshedAccountExportedTwice.lastTransactionFileCreatedAt).to.equal(new Date('2025-08-11T13:57:24.680Z'))
      expect(refreshedAccountExportedTwice.updatedAt).to.be.greaterThan(accountExportedTwice.updatedAt)

      // Confirm the account was not updated as it has already been processed
      expect(refreshedAccountPreviouslyProcessed.lastTransactionFile).to.equal('nalac50001')
      expect(refreshedAccountPreviouslyProcessed.lastTransactionFileCreatedAt).to.equal(
        new Date('2025-08-10T12:34:56.789Z')
      )
      expect(refreshedAccountPreviouslyProcessed.updatedAt).to.equal(accountPreviouslyProcessed.updatedAt)
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessCustomerFilesService.go(days)

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Customer files job complete')).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.count).to.equal(3)
    })
  })

  describe('when the Charging Module API response is empty', () => {
    beforeEach(() => {
      Sinon.stub(ChargingModuleViewCustomerFilesRequest, 'send').resolves({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.1'
          },
          statusCode: 200,
          body: []
        }
      })

      billRunQueryStub = Sinon.stub(BillingAccountModel, 'query').returns({
        patch: Sinon.stub().returnsThis(),
        where: Sinon.stub().returnsThis(),
        whereNot: Sinon.stub().resolves()
      })
    })

    it('updates no billing account records', async () => {
      await ProcessCustomerFilesService.go(days)

      expect(billRunQueryStub.called).to.be.false()
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessCustomerFilesService.go(days)

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Customer files job complete')).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.count).to.equal(0)
    })
  })

  describe('when the Charging Module API request fails', () => {
    beforeEach(() => {
      Sinon.stub(ChargingModuleViewCustomerFilesRequest, 'send').resolves({
        succeeded: false,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.1'
          },
          statusCode: 500,
          body: []
        }
      })
    })

    it('handles the error', async () => {
      await ProcessCustomerFilesService.go()

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Customer files job failed')
      expect(args[1]).to.be.null()
      expect(args[2]).to.be.an.error()
    })
  })
})
