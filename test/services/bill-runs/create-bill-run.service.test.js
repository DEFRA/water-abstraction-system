'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const BillRunModel = require('../../../app/models/bill-run.model.js')
const { closeConnection } = require('../../support/database.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const RegionModel = require('../../../app/models/region.model.js')

// Thing under test
const CreateBillRunService = require('../../../app/services/bill-runs/create-bill-run.service.js')

describe('Create Bill Run service', () => {
  const financialYearEndings = { fromFinancialYearEnding: 2023, toFinancialYearEnding: 2024 }
  let region

  beforeEach(async () => {
    region = RegionHelper.select()
  })

  after(async () => {
    await closeConnection()
  })

  describe('when the defaults are not overridden', () => {
    it('returns the new bill run instance containing the defaults', async () => {
      const result = await CreateBillRunService.go(region.id, financialYearEndings)

      expect(result).to.be.an.instanceOf(BillRunModel)

      expect(result.fromFinancialYearEnding).to.equal(2023)
      expect(result.toFinancialYearEnding).to.equal(2024)
      expect(result.batchType).to.equal('supplementary')
      expect(result.scheme).to.equal('sroc')
      expect(result.source).to.equal('wrls')
      expect(result.externalId).to.be.null()
      expect(result.status).to.equal('queued')
      expect(result.errorCode).to.be.null()

      expect(result.region).to.be.an.instanceOf(RegionModel)
      expect(result.region.id).to.equal(region.id)
    })
  })

  describe('when all defaults are overridden', () => {
    const batchType = 'annual'
    const scheme = 'wrls'
    const source = 'nald'
    const externalId = '2bbbe459-966e-4026-b5d2-2f10867bdddd'
    const status = 'error'
    const errorCode = 50

    it('returns the new bill run instance containing the provided values', async () => {
      const result = await CreateBillRunService.go(region.id, financialYearEndings, {
        batchType,
        scheme,
        source,
        externalId,
        status,
        errorCode
      })

      expect(result).to.be.an.instanceOf(BillRunModel)

      expect(result.fromFinancialYearEnding).to.equal(2023)
      expect(result.toFinancialYearEnding).to.equal(2024)
      expect(result.batchType).to.equal(batchType)
      expect(result.scheme).to.equal(scheme)
      expect(result.source).to.equal(source)
      expect(result.externalId).to.equal(externalId)
      expect(result.status).to.equal('error')
      expect(result.errorCode).to.equal(errorCode)

      expect(result.region).to.be.an.instanceOf(RegionModel)
      expect(result.region.id).to.equal(region.id)
    })
  })

  describe('when some defaults are overridden', () => {
    const externalId = '2bbbe459-966e-4026-b5d2-2f10867bdddd'
    const status = 'error'

    it('returns the new bill run instance containing the provided values', async () => {
      const result = await CreateBillRunService.go(region.id, financialYearEndings, { externalId, status })

      expect(result).to.be.an.instanceOf(BillRunModel)

      expect(result.fromFinancialYearEnding).to.equal(2023)
      expect(result.toFinancialYearEnding).to.equal(2024)
      expect(result.batchType).to.equal('supplementary')
      expect(result.scheme).to.equal('sroc')
      expect(result.source).to.equal('wrls')
      expect(result.externalId).to.equal(externalId)
      expect(result.status).to.equal('error')

      expect(result.region).to.be.an.instanceOf(RegionModel)
      expect(result.region.id).to.equal(region.id)
    })
  })
})
