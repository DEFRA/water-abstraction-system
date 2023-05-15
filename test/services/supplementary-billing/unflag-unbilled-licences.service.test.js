'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingInvoiceHelper = require('../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceLicenceHelper = require('../../support/helpers/water/billing-invoice-licence.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceModel = require('../../../app/models/water/licence.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const UnflagUnbilledLicencesService = require('../../../app/services/supplementary-billing/unflag-unbilled-licences.service.js')

describe('Unflag unbilled licences service', () => {
  const billingBatchId = '42e7a42b-8a9a-42b4-b527-2baaedf952f2'

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there are licences flagged for SROC supplementary billing', () => {
    let chargeVersions
    const licences = {
      notInBillRun: null,
      notBilledInBillRun: null,
      billedInBillRun: null
    }

    beforeEach(async () => {
      licences.notInBillRun = await LicenceHelper.add({ includeInSrocSupplementaryBilling: true })
      licences.notBilledInBillRun = await LicenceHelper.add({ includeInSrocSupplementaryBilling: true })
      licences.billedInBillRun = await LicenceHelper.add({ includeInSrocSupplementaryBilling: true })

      chargeVersions = [
        { licence: { licenceId: licences.notBilledInBillRun.licenceId } },
        { licence: { licenceId: licences.billedInBillRun.licenceId } }
      ]
    })

    describe('those licences in the current bill run', () => {
      describe('which were not billed', () => {
        it('are unflagged (include_in_sroc_supplementary_billing set to false)', async () => {
          await UnflagUnbilledLicencesService.go(billingBatchId, chargeVersions)

          const licenceToBeChecked = await LicenceModel.query().findById(licences.notBilledInBillRun.licenceId)

          expect(licenceToBeChecked.includeInSrocSupplementaryBilling).to.be.false()
        })
      })

      describe('which were billed', () => {
        beforeEach(async () => {
          const { billingInvoiceId } = await BillingInvoiceHelper.add({ billingBatchId })
          await BillingInvoiceLicenceHelper.add({ billingInvoiceId, licenceId: licences.billedInBillRun.licenceId })
        })

        it('are left flagged (include_in_sroc_supplementary_billing still true)', async () => {
          await UnflagUnbilledLicencesService.go(billingBatchId, chargeVersions)

          const licenceToBeChecked = await LicenceModel.query().findById(licences.billedInBillRun.licenceId)

          expect(licenceToBeChecked.includeInSrocSupplementaryBilling).to.be.true()
        })
      })
    })

    describe('those licences not in the current bill run', () => {
      it('leaves flagged (include_in_sroc_supplementary_billing still true)', async () => {
        await UnflagUnbilledLicencesService.go(billingBatchId, chargeVersions)

        const licenceToBeChecked = await LicenceModel.query().findById(licences.notInBillRun.licenceId)

        expect(licenceToBeChecked.includeInSrocSupplementaryBilling).to.be.true()
      })
    })
  })
})
