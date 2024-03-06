'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const FetchBillRunLicencesService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-bill-run-licences.service.js')

describe('Fetch Bill Run Licences service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there is a valid bill run', () => {
    let billRun
    let region

    beforeEach(async () => {
      region = await RegionHelper.add()
      billRun = await BillRunHelper.add({ regionId: region.id, batchType: 'two_part_tariff' })
    })

    it('returns details of the bill run', async () => {
      const result = await FetchBillRunLicencesService.go(billRun.id)

      expect(result.id).to.equal(billRun.id)
      expect(result.createdAt).to.equal(billRun.createdAt)
      expect(result.status).to.equal(billRun.status)
      expect(result.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
      expect(result.batchType).to.equal(billRun.batchType)
      expect(result.region.displayName).to.equal(region.displayName)
    })
  })

  describe('when there is an invalid bill run id passed to the service', () => {
    it('returns no results', async () => {
      const result = await FetchBillRunLicencesService.go('56db85ed-767f-4c83-8174-5ad9c80fd00d')

      expect(result).to.be.undefined()
    })
  })
})
