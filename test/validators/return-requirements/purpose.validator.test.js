'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const PurposeValidator = require('../../../app/validators/return-requirements/purpose.validator.js')

describe('Purpose validator', () => {
  const purposeIds = [
    '14794d57-1acf-4c91-8b48-4b1ec68bfd6f',
    '49088608-ee9f-491a-8070-6831240945ac',
    '1d03c79b-da97-4838-a68c-ccb613d54367',
    '02036782-81d2-43be-b6af-bf20898653e1'
  ]

  describe('when valid data is provided', () => {
    const payload = {
      purposes: [
        '14794d57-1acf-4c91-8b48-4b1ec68bfd6f',
        '49088608-ee9f-491a-8070-6831240945ac'
      ]
    }

    it('confirms the data is valid', () => {
      const result = PurposeValidator.go(payload, purposeIds)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    const payload = {
      purposes: [
        'Invalid purpose',
        'Invalid purpose',
        'Invalid purpose',
        'Invalid purpose',
        'Invalid purpose'
      ]
    }

    it('fails validation', () => {
      const result = PurposeValidator.go(payload, purposeIds)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select any purpose for the requirements for returns')
    })
  })

  describe('when no data is provided', () => {
    const payload = {}

    it('fails validation', () => {
      const result = PurposeValidator.go(payload, purposeIds)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select any purpose for the requirements for returns')
    })
  })
})
