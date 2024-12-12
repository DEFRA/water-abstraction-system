'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillHelper = require('../../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../../support/helpers/bill-licence.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const WorkflowHelper = require('../../../support/helpers/workflow.helper.js')

// Thing under test
const UnflagUnbilledLicencesService = require('../../../../app/services/bill-runs/supplementary/unflag-unbilled-licences.service.js')

describe('Unflag unbilled licences service', () => {
  let billRun

  describe('when there are licences flagged for SROC supplementary billing', () => {
    let allLicenceIds
    let licenceNotInBillRun
    let licenceNotBilledInBillRun
    let licenceNotBilledInBillRunAndWorkflow
    let licenceNotBilledInBillRunAndUpdated
    let licenceBilledInBillRun

    beforeEach(async () => {
      licenceNotInBillRun = await LicenceHelper.add({ includeInSrocBilling: true })
      licenceNotBilledInBillRun = await LicenceHelper.add({ includeInSrocBilling: true })

      licenceNotBilledInBillRunAndWorkflow = await LicenceHelper.add({ includeInSrocBilling: true })
      await WorkflowHelper.add({ licenceId: licenceNotBilledInBillRunAndWorkflow.id, deletedAt: null })

      licenceNotBilledInBillRunAndUpdated = await LicenceHelper.add({
        includeInSrocBilling: true,
        updatedAt: new Date('2099-01-01')
      })

      licenceBilledInBillRun = await LicenceHelper.add({ includeInSrocBilling: true })

      allLicenceIds = [
        licenceNotBilledInBillRun.id,
        licenceNotBilledInBillRunAndWorkflow.id,
        licenceNotBilledInBillRunAndUpdated.id,
        licenceBilledInBillRun.id
      ]

      billRun = {
        id: '42e7a42b-8a9a-42b4-b527-2baaedf952f2',
        createdAt: new Date(),
        scheme: 'sroc'
      }
    })

    describe('those licences in the current bill run', () => {
      describe('which were not billed', () => {
        describe('and are not in workflow or updated after the bill run was created', () => {
          it('unflags them for SROC supplementary billing', async () => {
            await UnflagUnbilledLicencesService.go(billRun, allLicenceIds)

            const licenceToBeChecked = await licenceNotBilledInBillRun.$query()

            expect(licenceToBeChecked.includeInSrocBilling).to.be.false()
          })
        })

        describe('but are in workflow', () => {
          it('leaves flagged for SROC supplementary billing', async () => {
            await UnflagUnbilledLicencesService.go(billRun, allLicenceIds)

            const licenceToBeChecked = await licenceNotBilledInBillRunAndWorkflow.$query()

            expect(licenceToBeChecked.includeInSrocBilling).to.be.true()
          })
        })

        describe('but were updated after the bill run was created', () => {
          it('leaves flagged for SROC supplementary billing', async () => {
            await UnflagUnbilledLicencesService.go(billRun, allLicenceIds)

            const licenceToBeChecked = await licenceNotBilledInBillRunAndUpdated.$query()

            expect(licenceToBeChecked.includeInSrocBilling).to.be.true()
          })
        })
      })

      describe('which were billed', () => {
        beforeEach(async () => {
          const { id: billId } = await BillHelper.add({ billRunId: billRun.id })

          await BillLicenceHelper.add({ billId, licenceId: licenceBilledInBillRun.id })
        })

        it('are left flagged (include_in_sroc_billing still true)', async () => {
          await UnflagUnbilledLicencesService.go(billRun, allLicenceIds)

          const licenceToBeChecked = await licenceBilledInBillRun.$query()

          expect(licenceToBeChecked.includeInSrocBilling).to.be.true()
        })
      })
    })

    describe('those licences not in the current bill run', () => {
      it('leaves flagged (include_in_sroc_billing still true)', async () => {
        await UnflagUnbilledLicencesService.go(billRun, allLicenceIds)

        const licenceToBeChecked = await licenceNotInBillRun.$query()

        expect(licenceToBeChecked.includeInSrocBilling).to.be.true()
      })
    })
  })
})
