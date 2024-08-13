'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const LicenceSupplementaryYearModel = require('../../../app/models/licence-supplementary-year.model.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FlagSupplementaryBillingService = require('../../../app/services/licences/flag-supplementary-billing.service.js')

describe('Flag Supplementary Billing Service', () => {
  let licence
  let years
  let region

  beforeEach(() => {
    region = RegionHelper.select()

    licence = {
      regionId: region.id,
      id: generateUUID()
    }

    years = [2023, 2024]
  })

  describe('when given licence details', () => {
    describe('and an array of years for supplementary billing', () => {
      describe('and an annual two-part tariff bill run has been sent for those years', () => {
        beforeEach(async () => {
          await BillRunHelper.add({ batchType: 'two_part_tariff', status: 'sent', regionId: region.id })
          await BillRunHelper.add({ batchType: 'two_part_tariff', status: 'sent', regionId: region.id, toFinancialYearEnding: 2024 })
        })

        it('persists the licence details in the licenceSupplementaryYears table', async () => {
          await FlagSupplementaryBillingService.go(licence, years)

          const result = await LicenceSupplementaryYearModel.query()
            .where('licenceId', licence.id)
            .orderBy('financialYearEnd', 'asc')

          expect(result[0].licenceId).to.equal(licence.id)
          expect(result[0].billRunId).to.equal(null)
          expect(result[0].financialYearEnd).to.equal(2023)
          expect(result[0].twoPartTariff).to.equal(true)

          expect(result[1].licenceId).to.equal(licence.id)
          expect(result[1].billRunId).to.equal(null)
          expect(result[1].financialYearEnd).to.equal(2024)
          expect(result[1].twoPartTariff).to.equal(true)
        })
      })

      describe('and an annual two-part tariff bill run has not been sent for those years', () => {
        it('does not persist the licence details in licenceSupplementaryYears table', async () => {
          await FlagSupplementaryBillingService.go(licence, years)

          const result = await LicenceSupplementaryYearModel.query()
            .where('licenceId', licence.id)

          expect(result).to.equal([])
        })
      })
    })
  })
})
