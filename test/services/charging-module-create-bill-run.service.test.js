'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const RegionHelper = require('../support/helpers/water/region.helper.js')

// Things we need to stub
const RequestLib = require('../../app/lib/request.lib.js')

// Thing under test
const ChargingModuleCreateBillRunService = require('../../app/services/charging-module-create-bill-run.service.js')

describe.only('Charge module create bill run service', () => {
  let testRegion

  beforeEach(async () => {
    await DatabaseHelper.clean()
    testRegion = await RegionHelper.add()
  })

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

    it('calls the Charging Module with the required options', async () => {
      await ChargingModuleCreateBillRunService.go(testRegion.regionId, 'sroc')

      const requestArgs = RequestLib.post.firstCall.args

      expect(requestArgs[0]).to.endWith('/wrls/bill-runs')
      expect(requestArgs[1]).to.include({ region: testRegion.chargeRegionId, ruleset: 'sroc' })
    })

    it('returns an object with the id and bill run number', async () => {
      const result = await ChargingModuleCreateBillRunService.go(testRegion.regionId, 'sroc')

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
      const result = await ChargingModuleCreateBillRunService.go(testRegion.regionId, 'sroc')

      expect(result).to.equal('NOPE')
    })
  })
})
