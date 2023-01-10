'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const RequestLib = require('../../app/lib/request.lib.js')

// Thing under test
const ChargingModuleCreateBillRunService = require('../../app/services/charging-module-create-bill-run.service.js')

describe.only('Charge module create bill run service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service can create a bill run', () => {
    beforeEach(() => {
      Sinon.stub(RequestLib, 'post').resolves({
        succeeded: true,
        response: {
          statusCode: 200,
          body: '{"billRun": {"id": "2bbbe459-966e-4026-b5d2-2f10867bdddd", "billRunNumber": 10004}}'
        }
      })
    })

    it('returns an object with the id and bill run number', async () => {
      const result = await ChargingModuleCreateBillRunService.go()

      expect(result.id).to.equal('2bbbe459-966e-4026-b5d2-2f10867bdddd')
      expect(result.billRunNumber).to.equal(10004)
    })
  })

  describe('when the service cannot create a bill run', () => {
    beforeEach(() => {
      Sinon.stub(RequestLib, 'post').resolves({
        succeeded: false,
        response: {
          statusCode: 403,
          error: 'Forbidden',
          message: "Unauthorised for regime 'wrls'"
        }
      })
    })

    it('returns the appropriate error response', async () => {
      const result = await ChargingModuleCreateBillRunService.go()

      expect(result).to.equal('NOPE')
    })
  })
})
