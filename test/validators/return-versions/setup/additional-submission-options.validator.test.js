'use strict'

// Test framework dependencies
const { describe, it } = require('node:test')
const { expect } = require('@hapi/code')

// Thing under test
const AdditionalSubmissionOptionsValidator = require('../../../../app/validators/return-versions/setup/additional-submission-options.validator.js')

describe('Return Versions Setup - Additional Submission Options validator', () => {
  describe('when valid data is provided', () => {
    const payload = {
      additionalSubmissionOptions: ['multiple-upload']
    }

    it('confirms the data is valid', () => {
      const result = AdditionalSubmissionOptionsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    const payload = {
      options: ['Invalid option']
    }

    it('fails validation', () => {
      const result = AdditionalSubmissionOptionsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal(
        'Select additional submission options for the requirements for returns'
      )
    })
  })

  describe('when no data is provided', () => {
    const payload = {}

    it('fails validation', () => {
      const result = AdditionalSubmissionOptionsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal(
        'Select additional submission options for the requirements for returns'
      )
    })
  })
})
