'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceHolderSeeder = require('../../../support/seeders/licence-holder.seeder.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReviewResultHelper = require('../../../support/helpers/review-result.helper.js')

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
      billRun = await BillRunHelper.add({ regionId: region.id })
    })

    describe('and there are licences in the bill run', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()
        await LicenceHolderSeeder.seed(testLicence.licenceRef)
        await ReviewResultHelper.add({ billRunId: billRun.id, licenceId: testLicence.id })
      })

      it('returns details of the bill run and the licences in it', async () => {
        const result = await FetchBillRunLicencesService.go(billRun.id)

        expect(result.billRun.id).to.equal(billRun.id)
        expect(result.billRun.createdAt).to.equal(billRun.createdAt)
        expect(result.billRun.status).to.equal(billRun.status)
        expect(result.billRun.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
        expect(result.billRun.scheme).to.equal(billRun.scheme)
        expect(result.billRun.batchType).to.equal(billRun.batchType)
        expect(result.billRun.region.displayName).to.equal(region.displayName)

        expect(result.billRunLicences).to.have.length(1)
        expect(result.billRunLicences[0].licenceId).to.equal(testLicence.id)
        expect(result.billRunLicences[0].licenceHolder).to.equal('Licence Holder Ltd')
        expect(result.billRunLicences[0].licenceRef).to.equal(testLicence.licenceRef)
      })
    })
  })

  describe('when there is an invalid bill run id passed to the service', () => {
    it('returns no results', async () => {
      const result = await FetchBillRunLicencesService.go('56db85ed-767f-4c83-8174-5ad9c80fd00d')

      expect(result.billRun).to.be.undefined()
      expect(result.billRunLicences).to.have.length(0)
    })
  })
})
