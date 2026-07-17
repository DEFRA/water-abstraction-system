// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import http2 from 'node:http2'

import ExpandedError from '../../../app/errors/expanded.error.js'
import billingConfig from '../../../config/billing.config.js'

// Things we need to stub
import * as ChargingModuleViewBillRunStatusRequest from '../../../app/requests/charging-module/view-bill-run-status.request.js'

// Thing under test
import ChargingModuleWaitForStatusRequest from '../../../app/requests/charging-module/wait-for-status.request.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Charging Module Wait For Status request', () => {
  const billRunId = '2bbbe459-966e-4026-b5d2-2f10867bdddd'
  const statusesToWaitFor = ['billed', 'billing_not_required']

  let chargingModuleViewBillRunStatusRequestStub
  let maxNumberOfAttempts

  beforeEach(async () => {
    chargingModuleViewBillRunStatusRequestStub = vi
      .spyOn(ChargingModuleViewBillRunStatusRequest, 'default')
      .mockImplementation(() => {})

    // Set the pause between requests to just 50ms so our tests are not slowed down or cause a timeout
    vi.replaceProperty(billingConfig, 'waitForStatusPauseInMs', 50)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the Charging Module returns one of the statuses waited for', () => {
    describe('on the first attempt', () => {
      beforeEach(() => {
        chargingModuleViewBillRunStatusRequestStub.mockResolvedValueOnce(_testResponse('billing_not_required'))
      })

      it('returns a "true" succeeded status', async () => {
        const result = await ChargingModuleWaitForStatusRequest(billRunId, statusesToWaitFor)

        expect(result.succeeded).toBe(true)
      })

      it('returns the last status received', async () => {
        const result = await ChargingModuleWaitForStatusRequest(billRunId, statusesToWaitFor)

        expect(result.status).toEqual('billing_not_required')
      })

      it('returns the number of attempts', async () => {
        const result = await ChargingModuleWaitForStatusRequest(billRunId, statusesToWaitFor)

        expect(result.attempts).toEqual(1)
      })
    })

    describe('after a number of attempts', () => {
      beforeEach(() => {
        // NOTE: We set the maximum number of attempts greater than how many it takes to succeed to demonstrate that the
        // service returns as soon as the status we are waiting for is returned.
        maxNumberOfAttempts = 5

        chargingModuleViewBillRunStatusRequestStub.mockResolvedValueOnce(_testResponse('processing'))
        chargingModuleViewBillRunStatusRequestStub.mockResolvedValueOnce(_testResponse('processing'))
        chargingModuleViewBillRunStatusRequestStub.mockResolvedValueOnce(_testResponse('billed'))
      })

      it('returns a "true" success status', async () => {
        const result = await ChargingModuleWaitForStatusRequest(billRunId, statusesToWaitFor, maxNumberOfAttempts)

        expect(result.succeeded).toBe(true)
      })

      it('returns the last status received', async () => {
        const result = await ChargingModuleWaitForStatusRequest(billRunId, statusesToWaitFor, maxNumberOfAttempts)

        expect(result.status).toEqual('billed')
      })

      it('returns the number of attempts', async () => {
        const result = await ChargingModuleWaitForStatusRequest(billRunId, statusesToWaitFor, maxNumberOfAttempts)

        expect(result.attempts).toEqual(3)
      })
    })
  })

  describe('when the Charging Module never returns the status waited for', () => {
    beforeEach(() => {
      // Set the number of attempts to the same as the number of requests we've stubbed
      maxNumberOfAttempts = 3

      chargingModuleViewBillRunStatusRequestStub.mockResolvedValueOnce(_testResponse('processing'))
      chargingModuleViewBillRunStatusRequestStub.mockResolvedValueOnce(_testResponse('processing'))
      chargingModuleViewBillRunStatusRequestStub.mockResolvedValueOnce(_testResponse('processing'))
    })

    it('returns a "false" success status', async () => {
      const result = await ChargingModuleWaitForStatusRequest(billRunId, statusesToWaitFor, maxNumberOfAttempts)

      expect(result.succeeded).toBe(false)
    })

    it('returns the last status received', async () => {
      const result = await ChargingModuleWaitForStatusRequest(billRunId, statusesToWaitFor, maxNumberOfAttempts)

      expect(result.status).toEqual('processing')
    })

    it('returns the number of attempts', async () => {
      const result = await ChargingModuleWaitForStatusRequest(billRunId, statusesToWaitFor, maxNumberOfAttempts)

      expect(result.attempts).toEqual(3)
    })
  })

  describe('when a request to get the bill run status fails', () => {
    beforeEach(() => {
      chargingModuleViewBillRunStatusRequestStub.mockResolvedValue({
        succeeded: false,
        response: {
          headers: {
            'x-cma-git-commit': '273604040a47e0977b0579a0fef0f09726d95e39',
            'x-cma-docker-tag': 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: HTTP_STATUS_NOT_FOUND,
          statusMessage: 'Not Found',
          body: { statusCode: HTTP_STATUS_NOT_FOUND, error: 'Not Found', message: 'Not Found' }
        }
      })
    })

    it('throws an error', async () => {
      const error = await ChargingModuleWaitForStatusRequest(billRunId, statusesToWaitFor).catch((e) => {
        return e
      })

      expect(error).toBeInstanceOf(ExpandedError)
      expect(error.message).toEqual('Charging Module wait for status request failed')
      expect(error.billRunExternalId).toEqual(billRunId)
      expect(error.responseBody).toEqual({
        statusCode: HTTP_STATUS_NOT_FOUND,
        error: 'Not Found',
        message: 'Not Found'
      })
    })
  })
})

function _testResponse(status = 'processing') {
  return {
    succeeded: true,
    response: {
      info: {
        gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
        dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
      },
      statusCode: HTTP_STATUS_OK,
      body: {
        status
      }
    }
  }
}
