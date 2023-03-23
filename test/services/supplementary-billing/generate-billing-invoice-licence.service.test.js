'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const GenerateBillingInvoiceLicenceService = require('../../../app/services/supplementary-billing/generate-billing-invoice-licence.service.js')

describe('Generate billing invoice licence service', () => {
  const licence = {
    licenceId: 'bfd93113-0ca7-4218-bff7-e685af360df4',
    licenceRef: '01/TEST/02'
  }

  const billingInvoiceId = 'f4fb6257-c50f-46ea-80b0-7533423d6efd'

  let currentBillingInvoiceLicence
  let expectedResult

  describe('when `currentBillingInvoiceLicence` is null', () => {
    beforeEach(() => {
      currentBillingInvoiceLicence = null
      expectedResult = _billingInvoiceLicenceGenerator(billingInvoiceId, licence)
    })

    it('returns a new billing invoice licence with the provided values', () => {
      const result = GenerateBillingInvoiceLicenceService.go(currentBillingInvoiceLicence, billingInvoiceId, licence)

      expect(result).to.equal(expectedResult, { skip: 'billingInvoiceLicenceId' })
    })
  })

  describe('when `currentBillingInvoiceLicence` is set', () => {
    beforeEach(() => {
      currentBillingInvoiceLicence = _billingInvoiceLicenceGenerator(billingInvoiceId, licence)
    })

    describe('and the billing invoice id matches', () => {
      describe('as well as the licence', () => {
        it('returns the `currentBillingInvoiceLicence`', async () => {
          const result = GenerateBillingInvoiceLicenceService.go(currentBillingInvoiceLicence, billingInvoiceId, licence)

          expect(result).to.equal(currentBillingInvoiceLicence)
        })
      })

      describe('but the licence does not', () => {
        const otherLicence = { licenceId: 'e6c07787-b367-408d-a2f8-a5313cfcef32', licenceRef: 'ABC1' }

        it('returns a new billing invoice licence with the provided values', () => {
          const result = GenerateBillingInvoiceLicenceService.go(currentBillingInvoiceLicence, billingInvoiceId, otherLicence)

          expect(result).not.to.equal(currentBillingInvoiceLicence)
          expect(result.billingInvoiceId).to.equal(billingInvoiceId)
          expect(result.licenceId).to.equal(otherLicence.licenceId)
        })
      })
    })

    describe('but the billing invoice id does not match', () => {
      const otherBillingInvoiceId = 'fc9c4a2f-819d-4b31-9bcc-39c795660602'

      it('returns a new billing invoice licence with the provided values', () => {
        const result = GenerateBillingInvoiceLicenceService.go(currentBillingInvoiceLicence, otherBillingInvoiceId, licence)

        expect(result).not.to.equal(currentBillingInvoiceLicence)
        expect(result.billingInvoiceId).to.equal(otherBillingInvoiceId)
        expect(result.licenceId).to.equal(licence.licenceId)
      })
    })
  })
})

function _billingInvoiceLicenceGenerator (billingInvoiceId, licence) {
  return {
    billingInvoiceLicenceId: 'fa0c763e-3976-42df-ae2c-e93a954701dd',
    billingInvoiceId,
    licenceRef: licence.licenceRef,
    licenceId: licence.licenceId
  }
}
