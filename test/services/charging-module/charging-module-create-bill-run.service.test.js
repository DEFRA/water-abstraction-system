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
const ChargingModuleTokenService = require('../../../app/services/charging-module/charging-module-token.service.js')
const RequestLib = require('../../../app/lib/request.lib.js')

// Thing under test
const ChargingModuleCreateBillRunService = require('../../../app/services/charging-module/charging-module-create-bill-run.service.js')

describe('Charge module create bill run service', () => {
  let testRegion

  beforeEach(async () => {
    await DatabaseHelper.clean()
    testRegion = await RegionHelper.add()

    Sinon.stub(ChargingModuleTokenService, 'go').resolves({
      accessToken: 'ACCESS_TOKEN',
      expiresIn: 3600
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service can create a bill run', () => {
    let result

    beforeEach(async () => {
      Sinon.stub(RequestLib, 'post').resolves({
        succeeded: true,
        response: {
          statusCode: 200,
          body: '{"billRun": {"id": "2bbbe459-966e-4026-b5d2-2f10867bdddd", "billRunNumber": 10004}}'
        }
      })

      result = await ChargingModuleCreateBillRunService.go(testRegion.regionId, 'sroc')
    })

    it('calls the Charging Module with the required options', async () => {
      const requestArgs = RequestLib.post.firstCall.args

      expect(requestArgs[0]).to.endWith('/wrls/bill-runs')
      expect(requestArgs[1].headers).to.include({ authorization: 'Bearer ACCESS_TOKEN' })
      expect(requestArgs[1].body).to.include({ region: testRegion.chargeRegionId, ruleset: 'sroc' })
    })

    it('returns a `true` success status', async () => {
      expect(result.succeeded).to.be.true()
    })

    it('returns the bill run id and number in the `response`', async () => {
      const { response } = result

      expect(response.id).to.equal('2bbbe459-966e-4026-b5d2-2f10867bdddd')
      expect(response.billRunNumber).to.equal(10004)
    })
  })

  describe('when the service cannot create a bill run', () => {
    let result

    beforeEach(async () => {
      Sinon.stub(RequestLib, 'post').resolves({
        succeeded: false,
        response: {
          statusCode: 403,
          error: 'Forbidden',
          message: "Unauthorised for regime 'wrls'"
        }
      })

      result = await ChargingModuleCreateBillRunService.go(testRegion.regionId, 'sroc')
    })

    it('returns a `false` success status', async () => {
      expect(result.succeeded).to.be.false()
    })

    it('returns the error in the `response`', async () => {
      const { response } = result

      expect(response.statusCode).to.equal(403)
      expect(response.error).to.equal('Forbidden')
      expect(response.message).to.equal("Unauthorised for regime 'wrls'")
    })
  })
})
