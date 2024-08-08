'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunModel = require('../../../app/models/bill-run.model.js')
const DatabaseSupport = require('../../support/database.js')
const EventModel = require('../../../app/models/event.model.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Things we need to stub
const ChargingModuleCreateBillRunRequest = require('../../../app/requests/charging-module/create-bill-run.request.js')
const DetermineBlockingBillRunService = require('../../../app/services/bill-runs/determine-blocking-bill-run.service.js')
const SupplementaryProcessBillRunService = require('../../../app/services/bill-runs/supplementary/process-bill-run.service.js')

// Thing under test
const InitiateBillRunService = require('../../../app/services/bill-runs/initiate-bill-run.service.js')

describe('Initiate Bill Run service', () => {
  const financialYearEndings = { fromFinancialYearEnding: 2023, toFinancialYearEnding: 2024 }
  const user = 'test.user@defra.gov.uk'

  let batchType
  let regionId

  beforeEach(async () => {
    await DatabaseSupport.clean()

    const region = RegionHelper.select()

    regionId = region.id

    // The InitiateBillRun service does not await the call to the ProcessBillRunService. It is intended to
    // kick of the process and then move on. This is why we simply stub it in the tests.
    Sinon.stub(SupplementaryProcessBillRunService, 'go')
  })

  afterEach(() => {
    Sinon.restore()
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

      Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([])

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
      await InitiateBillRunService.go(financialYearEndings, regionId, batchType, user)

      const result = await BillRunModel.query().limit(1).first()

      expect(result.externalId).to.equal(responseBody.billRun.id)
      expect(result.billRunNumber).to.equal(responseBody.billRun.billRunNumber)
    })

    it('creates a new event record', async () => {
      await InitiateBillRunService.go(financialYearEndings, regionId, batchType, user)

      const count = await EventModel.query().resultSize()

      expect(count).to.equal(1)
    })

    it('returns the new bill run', async () => {
      const result = await InitiateBillRunService.go(financialYearEndings, regionId, batchType, user)

      const billRun = await BillRunModel.query().limit(1).first()

      expect(result.id).to.equal(billRun.id)
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
        Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([])

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

        const billRun = await BillRunModel.query().limit(1).first()

        expect(result.id).to.equal(billRun.id)
        expect(result.regionId).to.equal(billRun.regionId)
        expect(result.scheme).to.equal('sroc')
        expect(result.batchType).to.equal('supplementary')
        expect(result.status).to.equal('error')
        expect(result.errorCode).to.equal(50)
      })
    })

    describe('because a live bill run already exists for this region, financial year and type', () => {
      beforeEach(() => {
        batchType = 'annual'

        Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([{ id: 'becf430d-f6dd-45a3-b943-42683f7bb889' }])
      })

      it('rejects with an appropriate error', async () => {
        const err = await expect(InitiateBillRunService.go(financialYearEndings, regionId, batchType, user)).to.reject()

        expect(err).to.be.an.error()
        expect(err.message).to.equal('Batch already live for region')
        expect(err.billRunId).to.equal('becf430d-f6dd-45a3-b943-42683f7bb889')
      })
    })
  })
})
