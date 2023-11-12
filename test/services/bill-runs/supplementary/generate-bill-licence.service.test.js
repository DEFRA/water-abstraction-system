'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const GenerateBillLicenceService = require('../../../../app/services/bill-runs/supplementary/generate-bill-licence.service.js')

describe('Generate Bill Licence service', () => {
  const licence = {
    licenceId: 'bfd93113-0ca7-4218-bff7-e685af360df4',
    licenceRef: '01/TEST/02'
  }

  const billingInvoiceId = 'f4fb6257-c50f-46ea-80b0-7533423d6efd'

  let expectedResult

  describe('when called', () => {
    beforeEach(() => {
      expectedResult = {
        billingInvoiceLicenceId: 'fa0c763e-3976-42df-ae2c-e93a954701dd',
        billingInvoiceId,
        licenceRef: licence.licenceRef,
        licenceId: licence.licenceId
      }
    })

    it('returns a new bill licence with the provided values', () => {
      const result = GenerateBillLicenceService.go(billingInvoiceId, licence)

      expect(result).to.equal(expectedResult, { skip: 'billingInvoiceLicenceId' })
    })
  })
})
