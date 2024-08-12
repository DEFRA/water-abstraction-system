'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const LicenceSupplementaryYearModel = require('../../../app/models/licence-supplementary-year.model.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Things we need to stub
const ChargeVersionYearsService = require('../../../app/services/licences/charge-version-years.service.js')

// Thing under test
const FlagSupplementaryBillingService = require('../../../app/services/licences/flag-supplementary-billing.service.js')

describe('Flag Supplementary Billing Service', () => {
  let payload
  let region
  let licenceId

  beforeEach(() => {
    payload = {
      chargeVersionId: '42a2b60b-74af-4324-9e1e-ffbffff4dbbc'
    }

    region = RegionHelper.select()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when given a valid chargeVersionId', () => {
    describe('with a start and end date covering multiple the financial years', () => {
      describe('with a charge reference that has two-part tariff indicators', () => {
        describe('and an annual two-part tariff bill run has been sent for that year', () => {
          beforeEach(async () => {
            licenceId = generateUUID()

            await BillRunHelper.add({ batchType: 'two_part_tariff', status: 'sent', regionId: region.id })
            await BillRunHelper.add({ batchType: 'two_part_tariff', status: 'sent', regionId: region.id, toFinancialYearEnding: 2024 })

            Sinon.stub(ChargeVersionYearsService, 'go').resolves({
              licence: {
                id: licenceId,
                regionId: region.id
              },
              years: [2023, 2024]
            })
          })

          it('persists the licence details in the licenceSupplementaryYears table', async () => {
            await FlagSupplementaryBillingService.go(payload)

            const result = await LicenceSupplementaryYearModel.query()
              .where('licenceId', licenceId)
              .orderBy('financialYearEnd', 'asc')

            expect(result[0].licenceId).to.equal(licenceId)
            expect(result[0].billRunId).to.equal(null)
            expect(result[0].financialYearEnd).to.equal(2023)
            expect(result[0].twoPartTariff).to.equal(true)

            expect(result[1].licenceId).to.equal(licenceId)
            expect(result[1].billRunId).to.equal(null)
            expect(result[1].financialYearEnd).to.equal(2024)
            expect(result[1].twoPartTariff).to.equal(true)
          })
        })

        describe('and an annual two-part tariff bill run has not been sent for that year', () => {
          beforeEach(async () => {
            licenceId = generateUUID()

            Sinon.stub(ChargeVersionYearsService, 'go').resolves({
              licence: {
                id: licenceId,
                regionId: region.id
              },
              years: [2023]
            })
          })

          it('does not persist the licence details in the licenceSupplementaryYears table', async () => {
            await FlagSupplementaryBillingService.go(payload)

            const result = await LicenceSupplementaryYearModel.query()
              .where('licenceId', licenceId)

            expect(result).to.equal([])
          })
        })
      })

      describe('with a charge reference that does not have two-part tariff indicators', () => {
        beforeEach(async () => {
          licenceId = generateUUID()

          Sinon.stub(ChargeVersionYearsService, 'go').resolves([])
        })

        it('does not persist the licence details in the licenceSupplementaryYears table', async () => {
          await FlagSupplementaryBillingService.go(payload)

          const result = await LicenceSupplementaryYearModel.query()
            .where('licenceId', licenceId)

          expect(result).to.equal([])
        })
      })
    })
  })
})
