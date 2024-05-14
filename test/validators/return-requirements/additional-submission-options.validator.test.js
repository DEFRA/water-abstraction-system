'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const AdditionalSubmissionOptionsValidator = require('../../../app/validators/return-requirements/additional-submission-options.validator.js')

describe('Additional Submission Options validator', () => {
  describe('when valid data is provided', () => {
    const payload = {
      'additional-submission-options': [
        'multiple-upload'
      ]
    }

    it('confirms the data is valid', () => {
      const result = AdditionalSubmissionOptionsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    const payload = {
      options: [
        'Invalid option'
      ]
    }

    it('fails validation', () => {
      const result = AdditionalSubmissionOptionsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select additional submission options for the requirements for returns')
    })
  })

  describe('when no data is provided', () => {
    const payload = {}

    it('fails validation', () => {
      const result = AdditionalSubmissionOptionsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select additional submission options for the requirements for returns')
    })
  })
})
