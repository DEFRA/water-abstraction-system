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
    const billingbatchId = '2bbbe459-966e-4026-b5d2-2f10867bdddd'
    const transactionData = {}

    let result

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
            transaction: 'DATA'
          }
        }
      })

      result = await ChargingModuleCreateTransactionService.go(billingbatchId, transactionData)
    })

    it('returns a `true` success status', async () => {
      expect(result.succeeded).to.be.true()
    })

    it('returns the transaction in the `response`', async () => {
      const { response } = result

      expect(response.body.transaction).to.equal('DATA')
    })
  })
})
