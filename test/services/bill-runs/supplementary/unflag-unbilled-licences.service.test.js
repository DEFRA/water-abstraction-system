'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillHelper = require('../../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../../support/helpers/bill-licence.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const DatabaseSupport = require('../../../support/database.js')

// Thing under test
const UnflagUnbilledLicencesService = require('../../../../app/services/bill-runs/supplementary/unflag-unbilled-licences.service.js')

describe('Unflag unbilled licences service', () => {
  const billRunId = '42e7a42b-8a9a-42b4-b527-2baaedf952f2'

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when there are licences flagged for SROC supplementary billing', () => {
    let allLicenceIds
    let licenceNotInBillRun
    let licenceNotBilledInBillRun
    let licenceBilledInBillRun

    beforeEach(async () => {
      licenceNotInBillRun = await LicenceHelper.add({ includeInSrocBilling: true })
      licenceNotBilledInBillRun = await LicenceHelper.add({ includeInSrocBilling: true })
      licenceBilledInBillRun = await LicenceHelper.add({ includeInSrocBilling: true })

      allLicenceIds = [licenceNotBilledInBillRun.id, licenceBilledInBillRun.id]
    })

    describe('those licences in the current bill run', () => {
      describe('which were not billed', () => {
        it('are unflagged (include_in_sroc_billing set to false)', async () => {
          await UnflagUnbilledLicencesService.go(billRunId, allLicenceIds)

          const licenceToBeChecked = await licenceNotBilledInBillRun.$query()

          expect(licenceToBeChecked.includeInSrocBilling).to.be.false()
        })
      })

      describe('which were billed', () => {
        beforeEach(async () => {
          const { id: billId } = await BillHelper.add({ billRunId })
          await BillLicenceHelper.add({ billId, licenceId: licenceBilledInBillRun.id })
        })

        it('are left flagged (include_in_sroc_billing still true)', async () => {
          await UnflagUnbilledLicencesService.go(billRunId, allLicenceIds)

          const licenceToBeChecked = await licenceBilledInBillRun.$query()

          expect(licenceToBeChecked.includeInSrocBilling).to.be.true()
        })
      })
    })

    describe('those licences not in the current bill run', () => {
      it('leaves flagged (include_in_sroc_billing still true)', async () => {
        await UnflagUnbilledLicencesService.go(billRunId, allLicenceIds)

        const licenceToBeChecked = await licenceNotInBillRun.$query()

        expect(licenceToBeChecked.includeInSrocBilling).to.be.true()
      })
    })
  })
})
