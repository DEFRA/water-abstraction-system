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

  let generatedBillingInvoiceLicences
  let expectedResult

  describe('when `generatedBillingInvoiceLicences` is empty', () => {
    beforeEach(() => {
      generatedBillingInvoiceLicences = []
      expectedResult = _billingInvoiceLicenceGenerator(billingInvoiceId, licence)
    })

    it('returns a new billing invoice licence and an array populated with just it', () => {
      const result = GenerateBillingInvoiceLicenceService.go(generatedBillingInvoiceLicences, billingInvoiceId, licence)

      expect(result.billingInvoiceLicence).to.equal(expectedResult, { skip: 'billingInvoiceLicenceId' })
      expect(result.billingInvoiceLicences).to.equal([result.billingInvoiceLicence])
    })
  })

  describe('when `generatedBillingInvoiceLicences` is populated', () => {
    describe('and a matching billing invoice licence exists', () => {
      let existingBillingInvoiceLicence

      beforeEach(() => {
        existingBillingInvoiceLicence = _billingInvoiceLicenceGenerator(billingInvoiceId, licence)
        generatedBillingInvoiceLicences = [existingBillingInvoiceLicence]
      })

      it('returns the existing billing invoice licence object and the existing array', () => {
        const result = GenerateBillingInvoiceLicenceService.go(generatedBillingInvoiceLicences, billingInvoiceId, licence)

        expect(result.billingInvoiceLicence).to.equal(existingBillingInvoiceLicence)
        expect(result.billingInvoiceLicences).to.equal(generatedBillingInvoiceLicences)
      })
    })

    describe('and a matching billing invoice licence does not exist', () => {
      let existingBillingInvoiceLicence

      beforeEach(() => {
        existingBillingInvoiceLicence = _billingInvoiceLicenceGenerator('d0761e82-9c96-4304-9b4c-3c5d4c1af8bb', licence)
        generatedBillingInvoiceLicences = [existingBillingInvoiceLicence]

        expectedResult = _billingInvoiceLicenceGenerator(billingInvoiceId, licence)
      })

      it('returns a new billing invoice licence object and the existing array with the new object included', () => {
        const result = GenerateBillingInvoiceLicenceService.go(generatedBillingInvoiceLicences, billingInvoiceId, licence)

        expect(result.billingInvoiceLicence).to.equal(expectedResult, { skip: 'billingInvoiceLicenceId' })
        expect(result.billingInvoiceLicences).to.equal([...generatedBillingInvoiceLicences, result.billingInvoiceLicence])
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
