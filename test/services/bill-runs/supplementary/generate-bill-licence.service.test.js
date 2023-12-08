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
    id: 'bfd93113-0ca7-4218-bff7-e685af360df4',
    licenceRef: '01/TEST/02'
  }

  const billId = 'f4fb6257-c50f-46ea-80b0-7533423d6efd'

  let expectedResult

  describe('when called', () => {
    beforeEach(() => {
      expectedResult = {
        id: '',
        billId,
        licenceId: licence.id,
        licenceRef: licence.licenceRef
      }
    })

    it('returns a new bill licence with the provided values', () => {
      const result = GenerateBillLicenceService.go(billId, licence)

      expect(result).to.equal(expectedResult, { skip: 'id' })
    })
  })
})
