// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import http2 from 'node:http2'

import ExpandedError from '../../../app/errors/expanded.error.js'

// Things we need to stub
import * as ChargingModuleRequest from '../../../app/requests/charging-module.request.js'
import * as WaitForStatusRequest from '../../../app/requests/charging-module/wait-for-status.request.js'

// Thing under test
import SendBillRunRequest from '../../../app/requests/charging-module/send-bill-run.request.js'

const { HTTP_STATUS_NO_CONTENT } = http2.constants

describe('Charging Module Send Bill Run request', () => {
  const billRunId = '2bbbe459-966e-4026-b5d2-2f10867bdddd'

  let chargingModuleRequestStub

  beforeEach(() => {
    chargingModuleRequestStub = vi.spyOn(ChargingModuleRequest, 'patchRequest').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request can send a bill run', () => {
    beforeEach(async () => {
      chargingModuleRequestStub.mockResolvedValue({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: HTTP_STATUS_NO_CONTENT,
          body: null
        }
      })
      vi.spyOn(WaitForStatusRequest, 'default').mockResolvedValue({ succeeded: true, status: 'billed', attempts: 1 })
    })

    it('returns a "true" success status', async () => {
      const result = await SendBillRunRequest(billRunId)

      expect(result.succeeded).toBe(true)
    })

    it('returns the last status received', async () => {
      const result = await SendBillRunRequest(billRunId)

      expect(result.status).toEqual('billed')
    })

    it('returns the number of attempts', async () => {
      const result = await SendBillRunRequest(billRunId)

      expect(result.attempts).toEqual(1)
    })
  })

  describe('when the request cannot send a bill run', () => {
    describe('because the approve request fails', () => {
      beforeEach(async () => {
        chargingModuleRequestStub.mockResolvedValueOnce({
          succeeded: false,
          response: { body: 'Boom' }
        })
      })

      it('throws an error', async () => {
        const error = await SendBillRunRequest(billRunId).catch((e) => {
          return e
        })

        expect(error).toBeInstanceOf(ExpandedError)
        expect(error.message).toEqual('Charging Module approve request failed')
        expect(error.billRunExternalId).toEqual(billRunId)
        expect(error.responseBody).toEqual('Boom')
      })
    })

    describe('because the send request fails', () => {
      beforeEach(async () => {
        chargingModuleRequestStub.mockResolvedValueOnce({ succeeded: true })
        chargingModuleRequestStub.mockResolvedValueOnce({
          succeeded: false,
          response: { body: 'Boom' }
        })
      })

      it('throws an error', async () => {
        const error = await SendBillRunRequest(billRunId).catch((e) => {
          return e
        })

        expect(error).toBeInstanceOf(ExpandedError)
        expect(error.message).toEqual('Charging Module send request failed')
        expect(error.billRunExternalId).toEqual(billRunId)
        expect(error.responseBody).toEqual('Boom')
      })
    })

    describe('because the wait request fails', () => {
      beforeEach(async () => {
        chargingModuleRequestStub.mockResolvedValueOnce({ succeeded: true })
        chargingModuleRequestStub.mockResolvedValueOnce({ succeeded: true })
        vi.spyOn(WaitForStatusRequest, 'default').mockResolvedValue({
          succeeded: false,
          attempts: 100,
          response: { body: 'Boom' }
        })
      })

      it('throws an error', async () => {
        const error = await SendBillRunRequest(billRunId).catch((e) => {
          return e
        })

        expect(error).toBeInstanceOf(ExpandedError)
        expect(error.message).toEqual('Charging Module wait request failed')
        expect(error.billRunExternalId).toEqual(billRunId)
        expect(error.attempts).toEqual(100)
        expect(error.responseBody).toEqual('Boom')
      })
    })
  })
})
