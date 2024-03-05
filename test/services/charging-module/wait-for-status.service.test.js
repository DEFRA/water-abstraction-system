'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const billingConfig = require('../../../config/billing.config.js')
const ExpandedError = require('../../../app/errors/expanded.error.js')

// Things we need to stub
const BillRunStatusService = require('../../../app/services/charging-module/bill-run-status.service.js')

// Thing under test
const ChargingModuleWaitForStatusService = require('../../../app/services/charging-module/wait-for-status.service.js')

describe('Charging Module Wait For Status service', () => {
  const billRunId = '2bbbe459-966e-4026-b5d2-2f10867bdddd'
  const statusesToWaitFor = ['billed', 'billing_not_required']

  let billRunStatusServiceStub
  let maxNumberOfAttempts

  beforeEach(async () => {
    billRunStatusServiceStub = Sinon.stub(BillRunStatusService, 'go')

    // Set the pause between requests to just 50ms so our tests are not slowed down or cause a timeout
    Sinon.replace(billingConfig, 'waitForStatusPauseInMs', 50)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the Charging Module returns one of the statuses waited for', () => {
    describe('on the first attempt', () => {
      beforeEach(() => {
        billRunStatusServiceStub.onFirstCall().resolves(_testResponse('billing_not_required'))
      })

      it('returns a `true` succeeded status', async () => {
        const result = await ChargingModuleWaitForStatusService.go(billRunId, statusesToWaitFor)

        expect(result.succeeded).to.be.true()
      })

      it('returns the last status received', async () => {
        const result = await ChargingModuleWaitForStatusService.go(billRunId, statusesToWaitFor)

        expect(result.status).to.equal('billing_not_required')
      })

      it('returns the number of attempts', async () => {
        const result = await ChargingModuleWaitForStatusService.go(billRunId, statusesToWaitFor)

        expect(result.attempts).to.equal(1)
      })
    })

    describe('after a number of attempts', () => {
      beforeEach(() => {
        // NOTE: We set the maximum number of attempts greater than how many it takes to succeed to demonstrate that the
        // service returns as soon as the status we are waiting for is returned.
        maxNumberOfAttempts = 5

        billRunStatusServiceStub.onFirstCall().resolves(_testResponse('processing'))
        billRunStatusServiceStub.onSecondCall().resolves(_testResponse('processing'))
        billRunStatusServiceStub.onThirdCall().resolves(_testResponse('billed'))
      })

      it('returns a `true` success status', async () => {
        const result = await ChargingModuleWaitForStatusService.go(billRunId, statusesToWaitFor, maxNumberOfAttempts)

        expect(result.succeeded).to.be.true()
      })

      it('returns the last status received', async () => {
        const result = await ChargingModuleWaitForStatusService.go(billRunId, statusesToWaitFor, maxNumberOfAttempts)

        expect(result.status).to.equal('billed')
      })

      it('returns the number of attempts', async () => {
        const result = await ChargingModuleWaitForStatusService.go(billRunId, statusesToWaitFor, maxNumberOfAttempts)

        expect(result.attempts).to.equal(3)
      })
    })
  })

  describe('when the Charging Module never returns the status waited for', () => {
    beforeEach(() => {
      // Set the number of attempts to the same as the number of requests we've stubbed
      maxNumberOfAttempts = 3

      billRunStatusServiceStub.onFirstCall().resolves(_testResponse('processing'))
      billRunStatusServiceStub.onSecondCall().resolves(_testResponse('processing'))
      billRunStatusServiceStub.onThirdCall().resolves(_testResponse('processing'))
    })

    it('returns a `false` success status', async () => {
      const result = await ChargingModuleWaitForStatusService.go(billRunId, statusesToWaitFor, maxNumberOfAttempts)

      expect(result.succeeded).to.be.false()
    })

    it('returns the last status received', async () => {
      const result = await ChargingModuleWaitForStatusService.go(billRunId, statusesToWaitFor, maxNumberOfAttempts)

      expect(result.status).to.equal('processing')
    })

    it('returns the number of attempts', async () => {
      const result = await ChargingModuleWaitForStatusService.go(billRunId, statusesToWaitFor, maxNumberOfAttempts)

      expect(result.attempts).to.equal(3)
    })
  })

  describe('when a request to get the bill run status fails', () => {
    beforeEach(() => {
      billRunStatusServiceStub.resolves({
        succeeded: false,
        response: {
          headers: {
            'x-cma-git-commit': '273604040a47e0977b0579a0fef0f09726d95e39',
            'x-cma-docker-tag': 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: 404,
          statusMessage: 'Not Found',
          body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
        }
      })
    })

    it('throws an error', async () => {
      const error = await expect(ChargingModuleWaitForStatusService.go(billRunId, statusesToWaitFor)).to.reject()

      expect(error).to.be.instanceOf(ExpandedError)
      expect(error.message).to.equal('Charging Module wait for status request failed')
      expect(error.billRunExternalId).to.equal(billRunId)
      expect(error.responseBody).to.equal({ statusCode: 404, error: 'Not Found', message: 'Not Found' })
    })
  })
})

function _testResponse (status = 'processing') {
  return {
    succeeded: true,
    response: {
      info: {
        gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
        dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
      },
      statusCode: 200,
      body: {
        status
      }
    }
  }
}
