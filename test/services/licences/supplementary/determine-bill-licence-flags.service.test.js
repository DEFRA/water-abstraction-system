'use strict'

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

    beforeAll(async () => {
      flaggedLicence = await LicenceHelper.add({ includeInSrocBilling: true, includeInPresrocBilling: 'yes' })
      unflaggedLicence = await LicenceHelper.add()
    })

    describe('being removed from a sroc two-part tariff bill run', () => {
      beforeAll(async () => {
        const billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', scheme: 'sroc' })
        bill = await BillHelper.add({ billRunId: billRun.id })
      })

      describe('for a licence that already has a pre-sroc and sroc flag', () => {
        beforeAll(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: flaggedLicence.licenceRef,
            licenceId: flaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.licenceId).toEqual(flaggedLicence.id)
          expect(result.regionId).toEqual(flaggedLicence.regionId)
          expect(result.startDate).toEqual(new Date('2022-04-01'))
          expect(result.endDate).toEqual(new Date('2023-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.flagForPreSrocSupplementary).toEqual(true)
          expect(result.flagForSrocSupplementary).toEqual(true)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(true)
        })
      })

      describe('for a licence with no pre-sroc or sroc flag', () => {
        beforeAll(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: unflaggedLicence.licenceRef,
            licenceId: unflaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.licenceId).toEqual(unflaggedLicence.id)
          expect(result.regionId).toEqual(unflaggedLicence.regionId)
          expect(result.startDate).toEqual(new Date('2022-04-01'))
          expect(result.endDate).toEqual(new Date('2023-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.flagForPreSrocSupplementary).toEqual(false)
          expect(result.flagForSrocSupplementary).toEqual(false)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(true)
        })
      })
    })

    describe('being removed from a pre-sroc two-part tariff bill run', () => {
      beforeAll(async () => {
        const billRun = await BillRunHelper.add({
          batchType: 'two_part_tariff',
          scheme: 'alcs',
          toFinancialYearEnding: '2021'
        })
        bill = await BillHelper.add({ billRunId: billRun.id })
      })

      describe('for a licence that already has a pre-sroc and sroc flag', () => {
        beforeAll(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: flaggedLicence.licenceRef,
            licenceId: flaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.licenceId).toEqual(flaggedLicence.id)
          expect(result.regionId).toEqual(flaggedLicence.regionId)
          expect(result.startDate).toEqual(new Date('2020-04-01'))
          expect(result.endDate).toEqual(new Date('2021-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.flagForPreSrocSupplementary).toEqual(true)
          expect(result.flagForSrocSupplementary).toEqual(true)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })

      describe('for a licence with no pre-sroc or sroc flag', () => {
        beforeAll(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: unflaggedLicence.licenceRef,
            licenceId: unflaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.licenceId).toEqual(unflaggedLicence.id)
          expect(result.regionId).toEqual(unflaggedLicence.regionId)
          expect(result.startDate).toEqual(new Date('2020-04-01'))
          expect(result.endDate).toEqual(new Date('2021-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.flagForPreSrocSupplementary).toEqual(true)
          expect(result.flagForSrocSupplementary).toEqual(false)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })
    })

    describe('being removed from a sroc annual bill run', () => {
      beforeAll(async () => {
        const billRun = await BillRunHelper.add({ batchType: 'annual', scheme: 'sroc' })
        bill = await BillHelper.add({ billRunId: billRun.id })
      })

      describe('for a licence that already has a pre-sroc and sroc flag', () => {
        beforeAll(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: flaggedLicence.licenceRef,
            licenceId: flaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.licenceId).toEqual(flaggedLicence.id)
          expect(result.regionId).toEqual(flaggedLicence.regionId)
          expect(result.startDate).toEqual(new Date('2022-04-01'))
          expect(result.endDate).toEqual(new Date('2023-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.flagForPreSrocSupplementary).toEqual(true)
          expect(result.flagForSrocSupplementary).toEqual(true)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })

      describe('for a licence with no pre-sroc or sroc flag', () => {
        beforeAll(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: unflaggedLicence.licenceRef,
            licenceId: unflaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.licenceId).toEqual(unflaggedLicence.id)
          expect(result.regionId).toEqual(unflaggedLicence.regionId)
          expect(result.startDate).toEqual(new Date('2022-04-01'))
          expect(result.endDate).toEqual(new Date('2023-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.flagForPreSrocSupplementary).toEqual(false)
          expect(result.flagForSrocSupplementary).toEqual(true)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })
    })

    describe('being removed from a pre-sroc bill run', () => {
      beforeAll(async () => {
        const billRun = await BillRunHelper.add({ batchType: 'annual', scheme: 'alcs', toFinancialYearEnding: '2021' })
        bill = await BillHelper.add({ billRunId: billRun.id })
      })

      describe('for a licence that already has a pre-sroc and sroc flag', () => {
        beforeAll(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: flaggedLicence.licenceRef,
            licenceId: flaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.licenceId).toEqual(flaggedLicence.id)
          expect(result.regionId).toEqual(flaggedLicence.regionId)
          expect(result.startDate).toEqual(new Date('2020-04-01'))
          expect(result.endDate).toEqual(new Date('2021-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.flagForPreSrocSupplementary).toEqual(true)
          expect(result.flagForSrocSupplementary).toEqual(true)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })

      describe('for a licence with no pre-sroc or sroc flag', () => {
        beforeAll(async () => {
          billLicence = await BillLicenceHelper.add({
            billId: bill.id,
            licenceRef: unflaggedLicence.licenceRef,
            licenceId: unflaggedLicence.id
          })
        })

        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.licenceId).toEqual(unflaggedLicence.id)
          expect(result.regionId).toEqual(unflaggedLicence.regionId)
          expect(result.startDate).toEqual(new Date('2020-04-01'))
          expect(result.endDate).toEqual(new Date('2021-03-31'))
        })

        it('returns the correct flags', async () => {
          const result = await DetermineBillLicenceFlagsService(billLicence.id)

          expect(result.flagForPreSrocSupplementary).toEqual(true)
          expect(result.flagForSrocSupplementary).toEqual(false)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })
    })
  })
})
