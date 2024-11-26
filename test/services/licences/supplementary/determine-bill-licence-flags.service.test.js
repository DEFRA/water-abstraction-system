'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillHelper = require('../../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../../support/helpers/bill-licence.helper.js')
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const DetermineBillLicenceFlagsService = require('../../../../app/services/licences/supplementary/determine-bill-licence-flags.service.js')

describe('Determine Bill Licence Flags Service', () => {
  describe('when passed a bill licence ID', () => {
    let bill
    let billLicence
    let flaggedLicence
    let unflaggedLicence

    before(async () => {
      flaggedLicence = await LicenceHelper.add({ includeInSrocBilling: true, includeInPresrocBilling: 'yes' })
      unflaggedLicence = await LicenceHelper.add()
    })

    describe('being removed from a sroc two-part tariff bill run', () => {
      before(async () => {
        const billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', scheme: 'sroc' })
        bill = await BillHelper.add({ billRunId: billRun.id })
      })

      describe('for a licence that already has a pre-sroc and sroc flag', () => {
        before(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: flaggedLicence.licenceRef,
            licenceId: flaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.licenceId).to.equal(flaggedLicence.id)
          expect(result.regionId).to.equal(flaggedLicence.regionId)
          expect(result.startDate).to.equal(new Date('2022-04-01'))
          expect(result.endDate).to.equal(new Date('2023-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(true)
        })
      })

      describe('for a licence with no pre-sroc or sroc flag', () => {
        before(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: unflaggedLicence.licenceRef,
            licenceId: unflaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.licenceId).to.equal(unflaggedLicence.id)
          expect(result.regionId).to.equal(unflaggedLicence.regionId)
          expect(result.startDate).to.equal(new Date('2022-04-01'))
          expect(result.endDate).to.equal(new Date('2023-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.flagForPreSrocSupplementary).to.equal(false)
          expect(result.flagForSrocSupplementary).to.equal(false)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(true)
        })
      })
    })

    describe('being removed from a pre-sroc two-part tariff bill run', () => {
      before(async () => {
        const billRun = await BillRunHelper.add({
          batchType: 'two_part_tariff',
          scheme: 'alcs',
          toFinancialYearEnding: '2021'
        })
        bill = await BillHelper.add({ billRunId: billRun.id })
      })

      describe('for a licence that already has a pre-sroc and sroc flag', () => {
        before(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: flaggedLicence.licenceRef,
            licenceId: flaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.licenceId).to.equal(flaggedLicence.id)
          expect(result.regionId).to.equal(flaggedLicence.regionId)
          expect(result.startDate).to.equal(new Date('2020-04-01'))
          expect(result.endDate).to.equal(new Date('2021-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })

      describe('for a licence with no pre-sroc or sroc flag', () => {
        before(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: unflaggedLicence.licenceRef,
            licenceId: unflaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.licenceId).to.equal(unflaggedLicence.id)
          expect(result.regionId).to.equal(unflaggedLicence.regionId)
          expect(result.startDate).to.equal(new Date('2020-04-01'))
          expect(result.endDate).to.equal(new Date('2021-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(false)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })
    })

    describe('being removed from a sroc annual bill run', () => {
      before(async () => {
        const billRun = await BillRunHelper.add({ batchType: 'annual', scheme: 'sroc' })
        bill = await BillHelper.add({ billRunId: billRun.id })
      })

      describe('for a licence that already has a pre-sroc and sroc flag', () => {
        before(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: flaggedLicence.licenceRef,
            licenceId: flaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.licenceId).to.equal(flaggedLicence.id)
          expect(result.regionId).to.equal(flaggedLicence.regionId)
          expect(result.startDate).to.equal(new Date('2022-04-01'))
          expect(result.endDate).to.equal(new Date('2023-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })

      describe('for a licence with no pre-sroc or sroc flag', () => {
        before(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: unflaggedLicence.licenceRef,
            licenceId: unflaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.licenceId).to.equal(unflaggedLicence.id)
          expect(result.regionId).to.equal(unflaggedLicence.regionId)
          expect(result.startDate).to.equal(new Date('2022-04-01'))
          expect(result.endDate).to.equal(new Date('2023-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.flagForPreSrocSupplementary).to.equal(false)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })
    })

    describe('being removed from a pre-sroc bill run', () => {
      before(async () => {
        const billRun = await BillRunHelper.add({ batchType: 'annual', scheme: 'alcs', toFinancialYearEnding: '2021' })
        bill = await BillHelper.add({ billRunId: billRun.id })
      })

      describe('for a licence that already has a pre-sroc and sroc flag', () => {
        before(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: flaggedLicence.licenceRef,
            licenceId: flaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.licenceId).to.equal(flaggedLicence.id)
          expect(result.regionId).to.equal(flaggedLicence.regionId)
          expect(result.startDate).to.equal(new Date('2020-04-01'))
          expect(result.endDate).to.equal(new Date('2021-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })

      describe('for a licence with no pre-sroc or sroc flag', () => {
        before(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: unflaggedLicence.licenceRef,
            licenceId: unflaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.licenceId).to.equal(unflaggedLicence.id)
          expect(result.regionId).to.equal(unflaggedLicence.regionId)
          expect(result.startDate).to.equal(new Date('2020-04-01'))
          expect(result.endDate).to.equal(new Date('2021-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService.go(billLicence.id)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(false)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })
    })
  })
})
