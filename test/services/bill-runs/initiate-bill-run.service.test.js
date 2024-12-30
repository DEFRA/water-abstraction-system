'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach, after } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const BillRunModel = require('../../../app/models/bill-run.model.js')
const { closeConnection } = require('../../support/database.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Things we need to stub
const ChargingModuleCreateBillRunRequest = require('../../../app/requests/charging-module/create-bill-run.request.js')
const CreateBillRunEventService = require('../../../app/services/bill-runs/create-bill-run-event.service.js')

// Thing under test
const InitiateBillRunService = require('../../../app/services/bill-runs/initiate-bill-run.service.js')

describe('Initiate Bill Run service', () => {
  const financialYearEndings = { fromFinancialYearEnding: 2023, toFinancialYearEnding: 2024 }
  const user = 'test.user@defra.gov.uk'

  let batchType
  let regionId

  beforeEach(async () => {
    const region = RegionHelper.select()

    regionId = region.id

    Sinon.stub(CreateBillRunEventService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(async () => {
    await closeConnection()
  })

  describe('when initiating a bill run succeeds', () => {
    const responseBody = {
      billRun: {
        id: '2bbbe459-966e-4026-b5d2-2f10867bdddd',
        billRunNumber: 10004
      }
    }

    beforeEach(() => {
      batchType = 'supplementary'

      Sinon.stub(ChargingModuleCreateBillRunRequest, 'send').resolves({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: 200,
          body: responseBody
        }
      })
    })

    it('creates a new bill run record', async () => {
      const result = await InitiateBillRunService.go(financialYearEndings, regionId, batchType, user)

      const billRun = await BillRunModel.query().findById(result.id)

      expect(billRun.externalId).to.equal(responseBody.billRun.id)
      expect(billRun.billRunNumber).to.equal(responseBody.billRun.billRunNumber)
    })

    it('creates a new event record', async () => {
      await InitiateBillRunService.go(financialYearEndings, regionId, batchType, user)

      expect(CreateBillRunEventService.go.called).to.be.true()
    })

    it('returns the new bill run', async () => {
      const result = await InitiateBillRunService.go(financialYearEndings, regionId, batchType, user)

      const billRun = await BillRunModel.query().findById(result.id)

      expect(result.regionId).to.equal(billRun.regionId)
      expect(result.scheme).to.equal('sroc')
      expect(result.batchType).to.equal('supplementary')
      expect(result.status).to.equal('queued')
      expect(result.errorCode).to.be.null()
    })
  })

  describe('when initiating a bill run fails', () => {
    describe('because a bill run could not be created in the Charging Module', () => {
      beforeEach(() => {
        Sinon.stub(ChargingModuleCreateBillRunRequest, 'send').resolves({
          succeeded: false,
          response: {
            info: {
              gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
              dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
            },
            statusCode: 403,
            body: {
              statusCode: 403,
              error: 'Forbidden',
              message: "Unauthorised for regime 'wrls'"
            }
          }
        })
      })

      it('creates a bill run with "error" status and error code 50', async () => {
        const result = await InitiateBillRunService.go(financialYearEndings, regionId, batchType, user)

        const billRun = await BillRunModel.query().findById(result.id)

        expect(result.regionId).to.equal(billRun.regionId)
        expect(result.scheme).to.equal('sroc')
        expect(result.batchType).to.equal('supplementary')
        expect(result.status).to.equal('error')
        expect(result.errorCode).to.equal(50)
      })
    })
  })
})
