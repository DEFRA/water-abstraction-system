'use strict'

// Test helpers
const BillRunModel = require('../../../app/models/bill-run.model.js')
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

  describe('when the defaults are not overridden', () => {
    it('returns the new bill run instance containing the defaults', async () => {
      const result = await CreateBillRunService.go(region.id, financialYearEndings)

      expect(result).toBeInstanceOf(BillRunModel)

      expect(result.fromFinancialYearEnding).toEqual(2023)
      expect(result.toFinancialYearEnding).toEqual(2024)
      expect(result.batchType).toEqual('supplementary')
      expect(result.scheme).toEqual('sroc')
      expect(result.source).toEqual('wrls')
      expect(result.externalId).toBeNull()
      expect(result.status).toEqual('queued')
      expect(result.errorCode).toBeNull()

      expect(result.region).toBeInstanceOf(RegionModel)
      expect(result.region.id).toEqual(region.id)
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

      expect(result).toBeInstanceOf(BillRunModel)

      expect(result.fromFinancialYearEnding).toEqual(2023)
      expect(result.toFinancialYearEnding).toEqual(2024)
      expect(result.batchType).toEqual(batchType)
      expect(result.scheme).toEqual(scheme)
      expect(result.source).toEqual(source)
      expect(result.externalId).toEqual(externalId)
      expect(result.status).toEqual('error')
      expect(result.errorCode).toEqual(errorCode)

      expect(result.region).toBeInstanceOf(RegionModel)
      expect(result.region.id).toEqual(region.id)
    })
  })

  describe('when some defaults are overridden', () => {
    const externalId = '2bbbe459-966e-4026-b5d2-2f10867bdddd'
    const status = 'error'

    it('returns the new bill run instance containing the provided values', async () => {
      const result = await CreateBillRunService.go(region.id, financialYearEndings, { externalId, status })

      expect(result).toBeInstanceOf(BillRunModel)

      expect(result.fromFinancialYearEnding).toEqual(2023)
      expect(result.toFinancialYearEnding).toEqual(2024)
      expect(result.batchType).toEqual('supplementary')
      expect(result.scheme).toEqual('sroc')
      expect(result.source).toEqual('wrls')
      expect(result.externalId).toEqual(externalId)
      expect(result.status).toEqual('error')

      expect(result.region).toBeInstanceOf(RegionModel)
      expect(result.region.id).toEqual(region.id)
    })
  })
})
