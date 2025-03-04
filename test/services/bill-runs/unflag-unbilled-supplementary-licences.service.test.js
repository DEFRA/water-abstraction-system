'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const BillHelper = require('../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../support/helpers/bill-licence.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceSupplementaryYearHelper = require('../../support/helpers/licence-supplementary-year.helper.js')
const WorkflowHelper = require('../../support/helpers/workflow.helper.js')

// Thing under test
const UnflagUnbilledSupplementaryLicencesService = require('../../../app/services/bill-runs/unflag-unbilled-supplementary-licences.service.js')

describe('Bill Runs - Unflag Unbilled Supplementary Licences service', () => {
  const billRun = { id: '42e7a42b-8a9a-42b4-b527-2baaedf952f2', scheme: 'sroc', toFinancialYearEnding: 2024 }

  describe('when the bill run is "standard" supplementary', () => {
    const stdSupplementary = {}

    beforeEach(async () => {
      stdSupplementary.licenceNotInBillRun = await LicenceHelper.add({ includeInSrocBilling: true })
      stdSupplementary.licenceNotBilledInBillRun = await LicenceHelper.add({ includeInSrocBilling: true })

      stdSupplementary.licenceNotBilledInBillRunAndWorkflow = await LicenceHelper.add({ includeInSrocBilling: true })
      stdSupplementary.workflow = await WorkflowHelper.add({
        licenceId: stdSupplementary.licenceNotBilledInBillRunAndWorkflow.id,
        deletedAt: null
      })

      stdSupplementary.licenceNotBilledInBillRunAndUpdated = await LicenceHelper.add({
        includeInSrocBilling: true,
        updatedAt: new Date('2099-01-01')
      })

      stdSupplementary.licenceBilledInBillRun = await LicenceHelper.add({ includeInSrocBilling: true })
      stdSupplementary.bill = await BillHelper.add({ billRunId: billRun.id })
      stdSupplementary.billLicence = await BillLicenceHelper.add({
        billId: stdSupplementary.bill.id,
        licenceId: stdSupplementary.licenceBilledInBillRun.id
      })

      stdSupplementary.allLicenceIds = [
        stdSupplementary.licenceNotBilledInBillRun.id,
        stdSupplementary.licenceNotBilledInBillRunAndWorkflow.id,
        stdSupplementary.licenceNotBilledInBillRunAndUpdated.id,
        stdSupplementary.licenceBilledInBillRun.id
      ]

      // We have to instantiate the bill run createdAt date last to ensure it is _after_ the updatedAt dates on the
      // licences
      billRun.batchType = 'supplementary'
      billRun.createdAt = new Date()
    })

    afterEach(async () => {
      await stdSupplementary.billLicence.$query().delete()
      await stdSupplementary.bill.$query().delete()
      await stdSupplementary.workflow.$query().delete()

      await stdSupplementary.licenceBilledInBillRun.$query().delete()
      await stdSupplementary.licenceNotBilledInBillRunAndUpdated.$query().delete()
      await stdSupplementary.licenceNotBilledInBillRunAndWorkflow.$query().delete()
      await stdSupplementary.licenceNotBilledInBillRun.$query().delete()
      await stdSupplementary.licenceNotInBillRun.$query().delete()
    })

    describe('the licences in the bill run that were flagged', () => {
      describe('which were not billed', () => {
        describe('and are not blocked from being unflagged', () => {
          it('unflags them', async () => {
            await UnflagUnbilledSupplementaryLicencesService.go(billRun, stdSupplementary.allLicenceIds)

            const licenceToBeChecked = await stdSupplementary.licenceNotBilledInBillRun.$query()

            expect(licenceToBeChecked.includeInSrocBilling).to.be.false()
          })
        })

        describe('but are in "workflow"', () => {
          it('leaves flagged for SROC standard supplementary billing', async () => {
            await UnflagUnbilledSupplementaryLicencesService.go(billRun, stdSupplementary.allLicenceIds)

            const licenceToBeChecked = await stdSupplementary.licenceNotBilledInBillRunAndWorkflow.$query()

            expect(licenceToBeChecked.includeInSrocBilling).to.be.true()
          })
        })

        describe('but were updated after the bill run was created', () => {
          it('leaves flagged for SROC standard supplementary billing', async () => {
            await UnflagUnbilledSupplementaryLicencesService.go(billRun, stdSupplementary.allLicenceIds)

            const licenceToBeChecked = await stdSupplementary.licenceNotBilledInBillRunAndUpdated.$query()

            expect(licenceToBeChecked.includeInSrocBilling).to.be.true()
          })
        })
      })

      describe('which were billed', () => {
        it('leaves flagged SROC standard supplementary billing', async () => {
          await UnflagUnbilledSupplementaryLicencesService.go(billRun, stdSupplementary.allLicenceIds)

          const licenceToBeChecked = await stdSupplementary.licenceBilledInBillRun.$query()

          expect(licenceToBeChecked.includeInSrocBilling).to.be.true()
        })
      })
    })

    describe('the licences not in the bill run that were flagged', () => {
      it('leaves flagged for SROC standard supplementary billing', async () => {
        await UnflagUnbilledSupplementaryLicencesService.go(billRun, stdSupplementary.allLicenceIds)

        const licenceToBeChecked = await stdSupplementary.licenceNotInBillRun.$query()

        expect(licenceToBeChecked.includeInSrocBilling).to.be.true()
      })
    })
  })

  describe('when the bill run is "two-part tariff" supplementary', () => {
    const tptSupplementary = {}

    beforeEach(async () => {
      // NOTE: Unlike standard supplementary, a licence is flagged by having a licence supplementary year record, not by
      // something on the licence record. Therefore, the presence (or not!) of the sup year record is what
      // denotes if a licence is flagged. This means for testing, we don't have to create the licence record as well.

      tptSupplementary.licenceNotInBillRunSupYear = await LicenceSupplementaryYearHelper.add({
        licenceId: generateUUID(),
        financialYearEnd: billRun.toFinancialYearEnding
      })

      tptSupplementary.licenceNotBilledInBillRunSupYear = await LicenceSupplementaryYearHelper.add({
        billRunId: billRun.id,
        licenceId: generateUUID(),
        financialYearEnd: billRun.toFinancialYearEnding
      })

      tptSupplementary.licenceNotBilledInBillRunAndWorkflowSupYear = await LicenceSupplementaryYearHelper.add({
        billRunId: billRun.id,
        licenceId: generateUUID(),
        financialYearEnd: billRun.toFinancialYearEnding
      })
      tptSupplementary.workflow = await WorkflowHelper.add({
        licenceId: tptSupplementary.licenceNotBilledInBillRunAndWorkflowSupYear.licenceId,
        deletedAt: null
      })

      // NOTE: Unlike standard where we used a different licence, we can confirm with TpT that if a licence that _is_
      // assigned to the bill run and was not billed (so we are going to delete the sup. year record), has another
      // entry because the licence was changed after the bill run was created, that we don't delete _that_ record.
      tptSupplementary.licenceNotBilledInBillRunAndUpdatedSupYear = await LicenceSupplementaryYearHelper.add({
        billRunId: null,
        licenceId: tptSupplementary.licenceNotBilledInBillRunSupYear.licenceId,
        financialYearEnd: billRun.toFinancialYearEnding
      })

      tptSupplementary.licenceBilledInBillRunSupYear = await LicenceSupplementaryYearHelper.add({
        licenceId: generateUUID(),
        financialYearEnd: billRun.toFinancialYearEnding
      })
      tptSupplementary.bill = await BillHelper.add({ billRunId: billRun.id })
      tptSupplementary.billLicence = await BillLicenceHelper.add({
        billId: tptSupplementary.bill.id,
        licenceId: tptSupplementary.licenceBilledInBillRunSupYear.licenceId
      })

      // We have to instantiate the bill run createdAt date last to ensure it is _after_ the updatedAt dates on the
      // licences
      billRun.batchType = 'two_part_supplementary'
      billRun.createdAt = new Date()
    })

    afterEach(async () => {
      await tptSupplementary.billLicence.$query().delete()
      await tptSupplementary.bill.$query().delete()
      await tptSupplementary.workflow.$query().delete()

      await tptSupplementary.licenceBilledInBillRunSupYear.$query().delete()
      await tptSupplementary.licenceNotBilledInBillRunAndUpdatedSupYear.$query().delete()
      await tptSupplementary.licenceNotBilledInBillRunAndWorkflowSupYear.$query().delete()
      await tptSupplementary.licenceNotBilledInBillRunSupYear.$query().delete()
      await tptSupplementary.licenceNotInBillRunSupYear.$query().delete()
    })

    describe('the licences in the bill run that were flagged', () => {
      describe('which were not billed', () => {
        describe('and are not blocked from being unflagged', () => {
          it('unflags them', async () => {
            await UnflagUnbilledSupplementaryLicencesService.go(billRun)

            const licenceSupYearToBeChecked = await tptSupplementary.licenceNotBilledInBillRunSupYear.$query()

            expect(licenceSupYearToBeChecked).not.exists()
          })
        })

        describe('but are in "workflow"', () => {
          it('leaves flagged for SROC two-part tariff supplementary billing', async () => {
            await UnflagUnbilledSupplementaryLicencesService.go(billRun)

            const licenceSupYearToBeChecked =
              await tptSupplementary.licenceNotBilledInBillRunAndWorkflowSupYear.$query()

            expect(licenceSupYearToBeChecked).exists()
          })
        })

        describe('but were updated after the bill run was created', () => {
          it('leaves flagged for SROC two-part tariff supplementary billing', async () => {
            await UnflagUnbilledSupplementaryLicencesService.go(billRun)

            const licenceSupYearToBeChecked = await tptSupplementary.licenceNotBilledInBillRunAndUpdatedSupYear.$query()

            expect(licenceSupYearToBeChecked).exists()
          })
        })
      })

      describe('which were billed', () => {
        it('leaves flagged SROC two-part tariff supplementary billing', async () => {
          await UnflagUnbilledSupplementaryLicencesService.go(billRun)

          const licenceSupYearToBeChecked = await tptSupplementary.licenceBilledInBillRunSupYear.$query()

          expect(licenceSupYearToBeChecked).exists()
        })
      })
    })

    describe('the licences not in the bill run that were flagged', () => {
      it('leaves flagged for SROC two-part tariff supplementary billing', async () => {
        await UnflagUnbilledSupplementaryLicencesService.go(billRun)

        const licenceSupYearToBeChecked = await tptSupplementary.licenceNotInBillRunSupYear.$query()

        expect(licenceSupYearToBeChecked).exists()
      })
    })
  })
})
