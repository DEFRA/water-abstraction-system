'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoBillingPeriodsError = require('../../../app/errors/no-billing-periods.error.js')

// Things we need to stub
const AnnualProcessBillRunService = require('../../../app/services/bill-runs/annual/process-bill-run.service.js')
const DetermineBillingPeriodsService = require('../../../app/services/bill-runs/determine-billing-periods.service.js')
const InitiateBillRunService = require('../../../app/services/bill-runs/initiate-bill-run.service.js')
const SupplementaryProcessBillRunService = require('../../../app/services/bill-runs/supplementary/process-bill-run.service.js')
const TwoPartTariffProcessBillRunService = require('../../../app/services/bill-runs/two-part-tariff/process-bill-run.service.js')

// Thing under test
const StartBillRunProcessService = require('../../../app/services/bill-runs/start-bill-run-process.service.js')

describe('Start Bill Run Process service', () => {
  const regionId = '3b24cc01-19c5-4654-8ef6-24ddb4c8dcdf'
  const userEmail = 'test@wrsl.gov.uk'

  const billRun = {
    id: 'e3bc5bb1-a223-43a2-b73f-10e6c4ed9626',
    regionId,
    scheme: 'sroc',
    batchType: 'supplementary',
    status: 'queued',
    externalId: '8c8448a6-f0ea-44a7-b41e-aafe79cb02f8',
    errorCode: null
  }

  let batchType

  afterEach(async () => {
    Sinon.restore()
  })

  describe('when the service succeeds', () => {
    beforeEach(async () => {
      const billingPeriods = [
        { startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') },
        { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }
      ]

      Sinon.stub(DetermineBillingPeriodsService, 'go').returns(billingPeriods)
    })

    describe('and the bill run type is "annual"', () => {
      beforeEach(async () => {
        batchType = 'annual'

        const annualBillRun = {
          ...billRun,
          batchType
        }

        Sinon.stub(InitiateBillRunService, 'go').resolves(annualBillRun)

        Sinon.stub(AnnualProcessBillRunService, 'go')
      })

      it('initiates a new bill run', async () => {
        await StartBillRunProcessService.go(regionId, userEmail)

        const financialYearEndings = InitiateBillRunService.go.firstCall.args[0]

        expect(financialYearEndings).to.equal({ fromFinancialYearEnding: 2023, toFinancialYearEnding: 2024 })
      })

      it('returns a response containing details of the new bill run', async () => {
        const result = await StartBillRunProcessService.go(regionId, batchType, userEmail)

        // NOTE: The result from the service is a the formatted result for the legacy UI. Hence the reference to
        // billingBatchId
        expect(result.billingBatchId).to.equal(billRun.id)
        expect(result.region).to.equal(billRun.regionId)
        expect(result.scheme).to.equal(billRun.scheme)
        expect(result.batchType).to.equal(batchType)
        expect(result.status).to.equal(billRun.status)
        expect(result.externalId).to.equal(billRun.externalId)
        expect(result.errorCode).to.equal(billRun.errorCode)
      })

      it('starts processing the bill run', async () => {
        await StartBillRunProcessService.go(regionId, userEmail)

        expect(AnnualProcessBillRunService.go.called).to.be.true()
      })
    })

    describe('and the bill run type is "supplementary"', () => {
      beforeEach(async () => {
        batchType = 'supplementary'

        const supplementaryBillRun = {
          ...billRun,
          batchType
        }

        Sinon.stub(InitiateBillRunService, 'go').resolves(supplementaryBillRun)

        Sinon.stub(SupplementaryProcessBillRunService, 'go')
      })

      it('initiates a new bill run', async () => {
        await StartBillRunProcessService.go(regionId, batchType, userEmail)

        const financialYearEndings = InitiateBillRunService.go.firstCall.args[0]

        expect(financialYearEndings).to.equal({ fromFinancialYearEnding: 2023, toFinancialYearEnding: 2024 })
      })

      it('returns a response containing details of the new bill run', async () => {
        const result = await StartBillRunProcessService.go(regionId, userEmail)

        // NOTE: The result from the service is a the formatted result for the legacy UI. Hence the reference to
        // billingBatchId
        expect(result.billingBatchId).to.equal(billRun.id)
        expect(result.region).to.equal(billRun.regionId)
        expect(result.scheme).to.equal(billRun.scheme)
        expect(result.batchType).to.equal(batchType)
        expect(result.status).to.equal(billRun.status)
        expect(result.externalId).to.equal(billRun.externalId)
        expect(result.errorCode).to.equal(billRun.errorCode)
      })

      it('starts processing the bill run', async () => {
        await StartBillRunProcessService.go(regionId, userEmail)

        expect(SupplementaryProcessBillRunService.go.called).to.be.true()
      })
    })

    describe('and the bill run type is "two part tariff"', () => {
      beforeEach(async () => {
        batchType = 'two_part_tariff'

        const twoPartTariffBillRun = {
          ...billRun,
          batchType
        }

        Sinon.stub(InitiateBillRunService, 'go').resolves(twoPartTariffBillRun)

        Sinon.stub(TwoPartTariffProcessBillRunService, 'go')
      })

      it('initiates a new bill run', async () => {
        await StartBillRunProcessService.go(regionId, userEmail)

        const financialYearEndings = InitiateBillRunService.go.firstCall.args[0]

        expect(financialYearEndings).to.equal({ fromFinancialYearEnding: 2023, toFinancialYearEnding: 2024 })
      })

      it('returns a response containing details of the new bill run', async () => {
        const result = await StartBillRunProcessService.go(regionId, batchType, userEmail)

        // NOTE: The result from the service is a the formatted result for the legacy UI. Hence the reference to
        // billingBatchId
        expect(result.billingBatchId).to.equal(billRun.id)
        expect(result.region).to.equal(billRun.regionId)
        expect(result.scheme).to.equal(billRun.scheme)
        expect(result.batchType).to.equal(batchType)
        expect(result.status).to.equal(billRun.status)
        expect(result.externalId).to.equal(billRun.externalId)
        expect(result.errorCode).to.equal(billRun.errorCode)
      })

      it('starts processing the bill run', async () => {
        await StartBillRunProcessService.go(regionId, userEmail)

        expect(TwoPartTariffProcessBillRunService.go.called).to.be.true()
      })
    })
  })

  describe('when calling the service fails', () => {
    describe('because of an unexpected error', () => {
      beforeEach(() => {
        Sinon.stub(DetermineBillingPeriodsService, 'go').throws()
      })

      it('throws an error', async () => {
        await expect(StartBillRunProcessService.go(regionId, userEmail)).to.reject()
      })
    })

    describe('because no billing periods could be determined', () => {
      beforeEach(() => {
        Sinon.stub(DetermineBillingPeriodsService, 'go').returns([])
      })

      it('throws a NoBillingPeriodsError', async () => {
        const result = await expect(StartBillRunProcessService.go(regionId, userEmail)).to.reject()

        expect(result).to.be.instanceOf(NoBillingPeriodsError)
      })
    })
  })
})
