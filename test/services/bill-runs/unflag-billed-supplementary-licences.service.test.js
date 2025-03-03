'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillHelper = require('../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../support/helpers/bill-licence.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const WorkflowHelper = require('../../support/helpers/workflow.helper.js')

// Thing under test
const UnflagBilledSupplementaryLicencesService = require('../../../app/services/bill-runs/unflag-billed-supplementary-licences.service.js')

describe('Bill Runs - Unflag Billed Supplementary Licences service', () => {
  const { id: regionId } = RegionHelper.select(RegionHelper.TEST_REGION_INDEX)

  let billRun

  describe('when there are licences flagged for PRESROC supplementary billing', () => {
    let licenceNotInRegion
    let licenceInWorkflow
    let licenceFlaggedAfterBillRunCreated
    let licenceFlaggedBeforeBillRunCreated

    beforeEach(async () => {
      const { id: otherRegionId } = RegionHelper.select(1)
      const updatedAt = new Date('2024-02-02')

      licenceNotInRegion = await LicenceHelper.add({
        includeInPresrocBilling: 'yes',
        regionId: otherRegionId,
        updatedAt
      })
      licenceInWorkflow = await LicenceHelper.add({
        includeInPresrocBilling: 'yes',
        regionId,
        updatedAt
      })
      await WorkflowHelper.add({ licenceId: licenceInWorkflow.id, deletedAt: null })

      licenceFlaggedAfterBillRunCreated = await LicenceHelper.add({
        includeInPresrocBilling: 'yes',
        regionId,
        updatedAt: new Date('2099-01-01')
      })
      licenceFlaggedBeforeBillRunCreated = await LicenceHelper.add({
        includeInPresrocBilling: 'yes',
        regionId,
        updatedAt
      })

      billRun = {
        id: 'fa5b8225-b616-4057-a268-1927c2f3eef1',
        createdAt: new Date('2024-02-03'),
        regionId,
        scheme: 'alcs'
      }
    })

    it('unflags those in the same region, not in workflow, and that were last updated before the bill run was created', async () => {
      await UnflagBilledSupplementaryLicencesService.go(billRun)

      let licenceBeingChecked

      // Check licence not in region still flagged
      licenceBeingChecked = await licenceNotInRegion.$query()
      expect(licenceBeingChecked.includeInPresrocBilling).to.equal('yes')

      // Check licence in workflow still flagged
      licenceBeingChecked = await licenceInWorkflow.$query()
      expect(licenceBeingChecked.includeInPresrocBilling).to.equal('yes')

      // Check licence flagged (updated) after the bill run was created
      licenceBeingChecked = await licenceFlaggedAfterBillRunCreated.$query()
      expect(licenceBeingChecked.includeInPresrocBilling).to.equal('yes')

      // Finally check the licence which matches the query has been unflagged
      licenceBeingChecked = await licenceFlaggedBeforeBillRunCreated.$query()
      expect(licenceBeingChecked.includeInPresrocBilling).to.equal('no')
    })
  })

  describe('when there are licences flagged for SROC supplementary billing', () => {
    let licenceNotInBillRun
    let licenceInBillRunAndWorkflow
    let licenceInBillRunAndFlaggedAfterBillRunCreated
    let licenceInBillRun

    beforeEach(async () => {
      licenceInBillRun = await LicenceHelper.add({ includeInSrocBilling: true })

      licenceNotInBillRun = await LicenceHelper.add({ includeInSrocBilling: true })

      licenceInBillRunAndWorkflow = await LicenceHelper.add({ includeInSrocBilling: true })
      await WorkflowHelper.add({ licenceId: licenceInBillRunAndWorkflow.id, deletedAt: null })

      licenceInBillRunAndFlaggedAfterBillRunCreated = await LicenceHelper.add({
        includeInSrocBilling: true,
        updatedAt: new Date('2099-01-01')
      })

      billRun = {
        id: 'fa5b8225-b616-4057-a268-1927c2f3eef1',
        createdAt: new Date(),
        regionId,
        scheme: 'sroc'
      }

      const { id: billId } = await BillHelper.add({ billRunId: billRun.id })

      await BillLicenceHelper.add({ billId, licenceId: licenceInBillRunAndWorkflow.id })
      await BillLicenceHelper.add({ billId, licenceId: licenceInBillRunAndFlaggedAfterBillRunCreated.id })
      await BillLicenceHelper.add({ billId, licenceId: licenceInBillRun.id })
    })

    it('unflags only those licences in the bill run that are not in workflow, and that were last updated before the bill run was created)', async () => {
      await UnflagBilledSupplementaryLicencesService.go(billRun)

      let licenceBeingChecked

      // Check licence not in bill run still flagged
      licenceBeingChecked = await licenceNotInBillRun.$query()
      expect(licenceBeingChecked.includeInSrocBilling).to.be.true()

      // Check licence in bill run but also in workflow still flagged
      licenceBeingChecked = await licenceInBillRunAndWorkflow.$query()
      expect(licenceBeingChecked.includeInSrocBilling).to.be.true()

      // Check licence in bill run but updated after bill run was created (e.g. charge version approved) still flagged
      licenceBeingChecked = await licenceInBillRunAndFlaggedAfterBillRunCreated.$query()
      expect(licenceBeingChecked.includeInSrocBilling).to.be.true()

      // Finally check the licence in the bill run with no other issues has been unflagged
      licenceBeingChecked = await licenceInBillRun.$query()
      expect(licenceBeingChecked.includeInSrocBilling).to.be.false()
    })
  })
})
