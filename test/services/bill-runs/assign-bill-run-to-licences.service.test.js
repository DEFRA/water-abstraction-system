'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceSupplementaryYearHelper = require('../../support/helpers/licence-supplementary-year.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const AssignBillRunToLicencesService = require('../../../app/services/bill-runs/assign-bill-run-to-licences.service.js')

// NOTE: These are declared outside the describe to make them accessible to our `_cleanUp()` function
let billRun
let assignedSameRegionAndYear
let unassignedSameRegionAndYear
let unassignedSameRegionDifferentYear
let unassignedDifferentRegionSameYear
let unassignedSameRegionAndYearNonTpt

describe('Bill Runs - Assign Bill Run To Licences service', () => {
  let region

  beforeEach(async () => {
    region = RegionHelper.select()

    billRun = await BillRunHelper.add({
      batchType: 'two_part_supplementary',
      regionId: region.id,
      scheme: 'sroc',
      status: 'processing',
      toFinancialYearEnding: 2024
    })
  })

  afterEach(async () => {
    await _cleanUp()
  })

  describe('when the supplementary year records are unassigned', () => {
    describe('and the financial year matches the bill run in progress', () => {
      describe('and the type of supplementary is the same', () => {
        describe('and the licences are for the same region as the bill run', () => {
          beforeEach(async () => {
            // Unassigned LSY for same year as bill run, and licence in same region as bill run
            const licence = await LicenceHelper.add({ regionId: region.id })
            const licenceSupplementaryYear = await LicenceSupplementaryYearHelper.add({
              financialYearEnd: 2024,
              licenceId: licence.id,
              twoPartTariff: true
            })

            unassignedSameRegionAndYear = { licence, licenceSupplementaryYear }
          })

          it('assigns the bill run to the supplementary year records', async () => {
            await AssignBillRunToLicencesService.go(billRun.id)

            const result = await unassignedSameRegionAndYear.licenceSupplementaryYear.$query().select()

            expect(result.billRunId).to.equal(billRun.id)
          })
        })

        describe('but the licences are for a different region to the bill run', () => {
          beforeEach(async () => {
            // Unassigned LSY for same year as bill run, but licence in different region to bill run
            const licence = await LicenceHelper.add({ regionId: generateUUID() })
            const licenceSupplementaryYear = await LicenceSupplementaryYearHelper.add({
              financialYearEnd: 2024,
              licenceId: licence.id,
              twoPartTariff: true
            })

            unassignedDifferentRegionSameYear = { licence, licenceSupplementaryYear }
          })

          it('does not assign the bill run to the supplementary year records', async () => {
            await AssignBillRunToLicencesService.go(billRun.id)

            const result = await unassignedDifferentRegionSameYear.licenceSupplementaryYear.$query().select()

            expect(result.billRunId).not.to.equal(billRun.id)
          })
        })
      })

      describe('but the type of supplementary is different', () => {
        beforeEach(async () => {
          // Unassigned LSY for same year as bill run, and licence in same region as bill run, but is not two-part tariff
          const licence = await LicenceHelper.add({ regionId: region.id })
          const licenceSupplementaryYear = await LicenceSupplementaryYearHelper.add({
            financialYearEnd: 2024,
            licenceId: licence.id,
            twoPartTariff: false
          })

          unassignedSameRegionAndYearNonTpt = { licence, licenceSupplementaryYear }
        })

        it('does not assign the bill run to the supplementary year records', async () => {
          await AssignBillRunToLicencesService.go(billRun.id)

          const result = await unassignedSameRegionAndYearNonTpt.licenceSupplementaryYear.$query().select()

          expect(result.billRunId).not.to.equal(billRun.id)
        })
      })
    })

    describe('but the financial year is different to the bill run in progress', () => {
      beforeEach(async () => {
        // Unassigned LSY for different year to bill run, but licence in same region as bill run
        const licence = await LicenceHelper.add({ regionId: region.id })
        const licenceSupplementaryYear = await LicenceSupplementaryYearHelper.add({
          financialYearEnd: 2023,
          licenceId: licence.id,
          twoPartTariff: true
        })

        unassignedSameRegionDifferentYear = { licence, licenceSupplementaryYear }
      })

      it('does not assign the bill run to the supplementary year records', async () => {
        await AssignBillRunToLicencesService.go(billRun.id)

        const result = await unassignedSameRegionDifferentYear.licenceSupplementaryYear.$query().select()

        expect(result.billRunId).not.to.equal(billRun.id)
      })
    })
  })

  describe('when the supplementary year records are already assigned', () => {
    beforeEach(async () => {
      // Already assigned LSY for same year as bill run, and licence in same region as bill run
      const licence = await LicenceHelper.add({ regionId: region.id })
      const licenceSupplementaryYear = await LicenceSupplementaryYearHelper.add({
        billRunId: 'e286f865-ebda-451b-89b6-4da947d6556b',
        financialYearEnd: 2024,
        licenceId: licence.id,
        twoPartTariff: true
      })

      assignedSameRegionAndYear = { licence, licenceSupplementaryYear }
    })

    it('does not assign the bill run to the supplementary year records', async () => {
      await AssignBillRunToLicencesService.go(billRun.id)

      const result = await assignedSameRegionAndYear.licenceSupplementaryYear.$query().select()

      expect(result.billRunId).not.to.equal(billRun.id)
    })
  })
})

async function _cleanUp() {
  if (billRun) await billRun.$query().delete()

  await _cleanUpEntry(assignedSameRegionAndYear)
  await _cleanUpEntry(unassignedSameRegionAndYear)
  await _cleanUpEntry(unassignedSameRegionDifferentYear)
  await _cleanUpEntry(unassignedDifferentRegionSameYear)
  await _cleanUpEntry(unassignedSameRegionAndYearNonTpt)
}

async function _cleanUpEntry(entry) {
  if (!entry) {
    return
  }

  if (entry.licence) await entry.licence.$query().delete()
  if (entry.licenceSupplementaryYear) await entry.licence.$query().delete()
}
