'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ChargingModuleRequestLib = require('../../../app/lib/charging-module-request.lib.js')

// Thing under test
const ChargingModuleCreateTransactionService = require('../../../app/services/charging-module/create-transaction.service.js')

describe('Charge module create transaction service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service can create a transaction', () => {
    const billingBatchId = '2bbbe459-966e-4026-b5d2-2f10867bdddd'
    const transactionData = { billingTransactionId: '2395429b-e703-43bc-8522-ce3f67507ffa' }

    beforeEach(async () => {
      Sinon.stub(ChargingModuleRequestLib, 'post').resolves({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: 200,
          body: {
            transaction: {
              id: 'fd88e6c5-8da8-4e4f-b22f-c66554cd5bf3',
              clientId: transactionData.billingTransactionId
            }
          }
        }
      })
    })

    it('returns a `true` success status', async () => {
      const result = await ChargingModuleCreateTransactionService.go(billingBatchId, transactionData)

      expect(result.succeeded).to.be.true()
    })

    it('returns the CM transaction ID and our ID in the `response`', async () => {
      const result = await ChargingModuleCreateTransactionService.go(billingBatchId, transactionData)

      expect(result.response.body.transaction.id).to.equal('fd88e6c5-8da8-4e4f-b22f-c66554cd5bf3')
      expect(result.response.body.transaction.clientId).to.equal(transactionData.billingTransactionId)
    })
  })
})
