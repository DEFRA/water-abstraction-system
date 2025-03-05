'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillHelper = require('../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../support/helpers/bill-licence.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceSupplementaryYearHelper = require('../../support/helpers/licence-supplementary-year.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const WorkflowHelper = require('../../support/helpers/workflow.helper.js')

// Thing under test
const UnflagBilledSupplementaryLicencesService = require('../../../app/services/bill-runs/unflag-billed-supplementary-licences.service.js')

describe('Bill Runs - Unflag Billed Supplementary Licences service', () => {
  const { id: regionId } = RegionHelper.select(RegionHelper.TEST_REGION_INDEX)
  const { id: otherRegionId } = RegionHelper.select(1)
  const billRun = { id: '42e7a42b-8a9a-42b4-b527-2baaedf952f2', regionId, toFinancialYearEnding: 2024 }

  describe('when the bill run is "standard" supplementary', () => {
    describe('and for the old PRESROC charge scheme', () => {
      const presrocSupplementary = {}

      beforeEach(async () => {
        presrocSupplementary.licenceToBeUnflagged = await LicenceHelper.add({
          includeInPresrocBilling: 'yes',
          regionId
        })

        presrocSupplementary.licenceNotInRegion = await LicenceHelper.add({
          includeInPresrocBilling: 'yes',
          regionId: otherRegionId
        })

        presrocSupplementary.licenceInWorkflow = await LicenceHelper.add({
          includeInPresrocBilling: 'yes',
          regionId
        })
        presrocSupplementary.workflow = await WorkflowHelper.add({
          licenceId: presrocSupplementary.licenceInWorkflow.id,
          deletedAt: null
        })

        // We have to instantiate the bill run createdAt date after the others but before the last licence to ensure the
        // tests for not unflagging licences updated the bill run is created will pass
        billRun.batchType = 'supplementary'
        billRun.createdAt = new Date()
        billRun.scheme = 'alcs'

        presrocSupplementary.licenceFlaggedAfterBillRunCreated = await LicenceHelper.add({
          includeInPresrocBilling: 'yes',
          regionId
        })
      })

      afterEach(async () => {
        await presrocSupplementary.workflow.$query().delete()

        await presrocSupplementary.licenceToBeUnflagged.$query().delete()
        await presrocSupplementary.licenceNotInRegion.$query().delete()
        await presrocSupplementary.licenceInWorkflow.$query().delete()
        await presrocSupplementary.licenceFlaggedAfterBillRunCreated.$query().delete()
      })

      describe('the licences in the bill run that were flagged', () => {
        describe('and are not blocked from being unflagged', () => {
          it('unflags them', async () => {
            await UnflagBilledSupplementaryLicencesService.go(billRun)

            const licenceToBeChecked = await presrocSupplementary.licenceToBeUnflagged.$query()

            expect(licenceToBeChecked.includeInPresrocBilling).to.equal('no')
          })
        })

        describe('but are in "workflow"', () => {
          it('leaves flagged for PRESROC standard supplementary billing', async () => {
            await UnflagBilledSupplementaryLicencesService.go(billRun)

            const licenceToBeChecked = await presrocSupplementary.licenceInWorkflow.$query()

            expect(licenceToBeChecked.includeInPresrocBilling).to.equal('yes')
          })
        })

        describe('but were updated after the bill run was created', () => {
          it('leaves flagged for PRESROC standard supplementary billing', async () => {
            await UnflagBilledSupplementaryLicencesService.go(billRun)

            const licenceToBeChecked = await presrocSupplementary.licenceFlaggedAfterBillRunCreated.$query()

            expect(licenceToBeChecked.includeInPresrocBilling).to.equal('yes')
          })
        })
      })

      describe('the licences not in the bill run that were flagged', () => {
        it('leaves flagged for PRESROC standard supplementary billing', async () => {
          await UnflagBilledSupplementaryLicencesService.go(billRun)

          const licenceToBeChecked = await presrocSupplementary.licenceNotInRegion.$query()

          expect(licenceToBeChecked.includeInPresrocBilling).to.equal('yes')
        })
      })
    })

    describe('and for the SROC charge scheme', () => {
      const srocSupplementary = {}

      beforeEach(async () => {
        srocSupplementary.licenceToBeUnflagged = await LicenceHelper.add({
          includeInSrocBilling: true,
          regionId
        })
        srocSupplementary.bill = await BillHelper.add({ billRunId: billRun.id })
        srocSupplementary.billLicence = await BillLicenceHelper.add({
          billId: srocSupplementary.bill.id,
          licenceId: srocSupplementary.licenceToBeUnflagged.id
        })

        srocSupplementary.licenceNotInBillRun = await LicenceHelper.add({
          includeInSrocBilling: true,
          regionId: otherRegionId
        })

        srocSupplementary.licenceInWorkflow = await LicenceHelper.add({
          includeInSrocBilling: true,
          regionId
        })
        srocSupplementary.workflow = await WorkflowHelper.add({
          licenceId: srocSupplementary.licenceInWorkflow.id,
          deletedAt: null
        })

        srocSupplementary.licenceFlaggedAfterBillRunCreated = await LicenceHelper.add({
          includeInSrocBilling: true,
          regionId
        })

        // We have to instantiate the bill run createdAt date last to ensure it is _after_ the updatedAt dates on the
        // licences
        billRun.batchType = 'supplementary'
        billRun.createdAt = new Date()
        billRun.scheme = 'sroc'
      })

      afterEach(async () => {
        await srocSupplementary.workflow.$query().delete()
        await srocSupplementary.billLicence.$query().delete()
        await srocSupplementary.bill.$query().delete()

        await srocSupplementary.licenceToBeUnflagged.$query().delete()
        await srocSupplementary.licenceNotInBillRun.$query().delete()
        await srocSupplementary.licenceInWorkflow.$query().delete()
        await srocSupplementary.licenceFlaggedAfterBillRunCreated.$query().delete()
      })

      describe('the licences in the bill run that were flagged', () => {
        describe('and are not blocked from being unflagged', () => {
          it('unflags them', async () => {
            await UnflagBilledSupplementaryLicencesService.go(billRun)

            const licenceToBeChecked = await srocSupplementary.licenceToBeUnflagged.$query()

            expect(licenceToBeChecked.includeInSrocBilling).to.be.false()
          })
        })

        describe('but are in "workflow"', () => {
          it('leaves flagged for SROC standard supplementary billing', async () => {
            await UnflagBilledSupplementaryLicencesService.go(billRun)

            const licenceToBeChecked = await srocSupplementary.licenceInWorkflow.$query()

            expect(licenceToBeChecked.includeInSrocBilling).to.be.true()
          })
        })

        describe('but were updated after the bill run was created', () => {
          it('leaves flagged for SROC standard supplementary billing', async () => {
            await UnflagBilledSupplementaryLicencesService.go(billRun)

            const licenceToBeChecked = await srocSupplementary.licenceFlaggedAfterBillRunCreated.$query()

            expect(licenceToBeChecked.includeInSrocBilling).to.be.true()
          })
        })
      })

      describe('the licences not in the bill run that were flagged', () => {
        it('leaves flagged for SROC standard supplementary billing', async () => {
          await UnflagBilledSupplementaryLicencesService.go(billRun)

          const licenceToBeChecked = await srocSupplementary.licenceNotInBillRun.$query()

          expect(licenceToBeChecked.includeInSrocBilling).to.be.true()
        })
      })
    })
  })

  describe('when the bill run is "two-part tariff" supplementary', () => {
    const tptSupplementary = {}

    beforeEach(async () => {
      // NOTE: Unlike standard supplementary, a licence is flagged by having a licence supplementary year record, not by
      // something on the licence record. Therefore, the presence (or not!) of the sup year record is what
      // denotes if a licence is flagged. This means for testing, we don't have to create the licence record as well.

      tptSupplementary.licenceToBeUnflaggedSupYear = await LicenceSupplementaryYearHelper.add({
        billRunId: billRun.id,
        financialYearEnd: billRun.toFinancialYearEnding
      })
      tptSupplementary.bill = await BillHelper.add({ billRunId: billRun.id })
      tptSupplementary.billLicence = await BillLicenceHelper.add({
        billId: tptSupplementary.bill.id,
        licenceId: tptSupplementary.licenceToBeUnflaggedSupYear.licenceId
      })

      tptSupplementary.licenceNotInBillRunSupYear = await LicenceSupplementaryYearHelper.add({
        financialYearEnd: billRun.toFinancialYearEnding
      })

      tptSupplementary.licenceInWorkflowSupYear = await LicenceSupplementaryYearHelper.add({
        billRunId: billRun.id,
        financialYearEnd: billRun.toFinancialYearEnding
      })
      tptSupplementary.workflow = await WorkflowHelper.add({
        licenceId: tptSupplementary.licenceInWorkflowSupYear.licenceId,
        deletedAt: null
      })

      // NOTE: Unlike standard where we used a different licence, we can confirm with TpT that if a licence that _is_
      // assigned to the bill run and was billed (so we are going to delete the sup. year record), has another
      // entry because the licence was changed after the bill run was created, that we don't delete _that_ record.
      tptSupplementary.licenceInBillRunButUpdatedSupYear = await LicenceSupplementaryYearHelper.add({
        billRunId: null,
        licenceId: tptSupplementary.licenceToBeUnflaggedSupYear.licenceId,
        financialYearEnd: billRun.toFinancialYearEnding
      })

      billRun.batchType = 'two_part_supplementary'
      billRun.createdAt = new Date()
      billRun.scheme = 'sroc'
    })

    afterEach(async () => {
      await tptSupplementary.billLicence.$query().delete()
      await tptSupplementary.bill.$query().delete()
      await tptSupplementary.workflow.$query().delete()

      await tptSupplementary.licenceToBeUnflaggedSupYear.$query().delete()
      await tptSupplementary.licenceInBillRunButUpdatedSupYear.$query().delete()
      await tptSupplementary.licenceInWorkflowSupYear.$query().delete()
      await tptSupplementary.licenceNotInBillRunSupYear.$query().delete()
    })

    describe('the licences in the bill run that were flagged', () => {
      describe('and are not blocked from being unflagged', () => {
        it('unflags them', async () => {
          await UnflagBilledSupplementaryLicencesService.go(billRun)

          const licenceSupYearToBeChecked = await tptSupplementary.licenceToBeUnflaggedSupYear.$query()

          expect(licenceSupYearToBeChecked).not.exists()
        })
      })

      describe('but are in "workflow"', () => {
        it('leaves flagged for SROC two-part tariff supplementary billing', async () => {
          await UnflagBilledSupplementaryLicencesService.go(billRun)

          const licenceSupYearToBeChecked = await tptSupplementary.licenceInWorkflowSupYear.$query()

          expect(licenceSupYearToBeChecked).exists()
        })
      })

      describe('but were updated after the bill run was created', () => {
        it('leaves flagged for SROC two-part tariff supplementary billing', async () => {
          await UnflagBilledSupplementaryLicencesService.go(billRun)

          const licenceSupYearToBeChecked = await tptSupplementary.licenceInBillRunButUpdatedSupYear.$query()

          expect(licenceSupYearToBeChecked).exists()
        })
      })
    })

    describe('the licences not in the bill run that were flagged', () => {
      it('leaves flagged for SROC two-part tariff supplementary billing', async () => {
        await UnflagBilledSupplementaryLicencesService.go(billRun)

        const licenceSupYearToBeChecked = await tptSupplementary.licenceNotInBillRunSupYear.$query()

        expect(licenceSupYearToBeChecked).exists()
      })
    })
  })
})
