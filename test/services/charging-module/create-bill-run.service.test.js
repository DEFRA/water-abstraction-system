'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Things we need to stub
const ChargingModuleRequestLib = require('../../../app/lib/charging-module-request.lib.js')

// Thing under test
const ChargingModuleCreateBillRunService = require('../../../app/services/charging-module/create-bill-run.service.js')

describe('Charge module create bill run service', () => {
  let testRegion

  beforeEach(async () => {
    await DatabaseHelper.clean()
    testRegion = await RegionHelper.add()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service can create a bill run', () => {
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
            billRun: {
              id: '2bbbe459-966e-4026-b5d2-2f10867bdddd',
              billRunNumber: 10004
            }
          }
        }
      })

      result = await ChargingModuleCreateBillRunService.go(testRegion.regionId, 'sroc')
    })

    it('returns a `true` success status', async () => {
      expect(result.succeeded).to.be.true()
    })

    it('returns the bill run id and number in the `response`', async () => {
      const { response } = result

      expect(response.body.billRun.id).to.equal('2bbbe459-966e-4026-b5d2-2f10867bdddd')
      expect(response.body.billRun.billRunNumber).to.equal(10004)
    })
  })

  describe('when the service cannot create a bill run', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        Sinon.stub(ChargingModuleRequestLib, 'post').resolves({
          succeeded: false,
          response: {
            info: {
              gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
              dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
            },
            statusCode: 401,
            body: {
              statusCode: 401,
              error: 'Unauthorized',
              message: 'Invalid JWT: Token format not valid',
              attributes: { error: 'Invalid JWT: Token format not valid' }
            }
          }
        })
      })

      it('returns a `false` success status', async () => {
        const result = await ChargingModuleCreateBillRunService.go(testRegion.regionId, 'sroc')

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the `response`', async () => {
        const result = await ChargingModuleCreateBillRunService.go(testRegion.regionId, 'sroc')

        expect(result.response.body.statusCode).to.equal(401)
        expect(result.response.body.error).to.equal('Unauthorized')
        expect(result.response.body.message).to.equal('Invalid JWT: Token format not valid')
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        Sinon.stub(ChargingModuleRequestLib, 'post').resolves({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms")
        })
      })

      it('returns a `false` success status', async () => {
        const result = await ChargingModuleCreateBillRunService.go(testRegion.regionId, 'sroc')

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the `response`', async () => {
        const result = await ChargingModuleCreateBillRunService.go(testRegion.regionId, 'sroc')

        expect(result.response.statusCode).not.to.exist()
        expect(result.response.body).not.to.exist()
        expect(result.response.message).to.equal("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
