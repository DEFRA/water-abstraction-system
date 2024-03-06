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
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')

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

    describe('and there are licences in the bill run', () => {
      let testLicenceReady

      beforeEach(async () => {
        testLicenceReady = await ReviewLicenceHelper.add({ billRunId: billRun.id })
        await ReviewLicenceHelper.add({ billRunId: billRun.id, status: 'review' })
      })

      it('returns details of the bill run and the licences in it', async () => {
        const result = await FetchBillRunLicencesService.go(billRun.id)

        expect(result.billRun.id).to.equal(billRun.id)
        expect(result.billRun.createdAt).to.equal(billRun.createdAt)
        expect(result.billRun.status).to.equal(billRun.status)
        expect(result.billRun.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
        expect(result.billRun.batchType).to.equal(billRun.batchType)
        expect(result.billRun.region.displayName).to.equal(region.displayName)

        expect(result.licences).to.have.length(2)
        expect(result.licences[1].licenceId).to.equal(testLicenceReady.licenceId)
        expect(result.licences[1].licenceHolder).to.equal('Licence Holder Ltd')
        expect(result.licences[1].licenceRef).to.equal(testLicenceReady.licenceRef)
      })

      it("orders the licence by 'review status'", async () => {
        const result = await FetchBillRunLicencesService.go(billRun.id)

        expect(result.licences[0].status).to.equal('review')
        expect(result.licences[1].status).to.equal('ready')
      })
    })
  })

  describe('when there is an invalid bill run id passed to the service', () => {
    it('returns no results', async () => {
      const result = await FetchBillRunLicencesService.go('56db85ed-767f-4c83-8174-5ad9c80fd00d')

      expect(result.billRun).to.be.undefined()
      expect(result.licences).to.have.length(0)
    })
  })
})
