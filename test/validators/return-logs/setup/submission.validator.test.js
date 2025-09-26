'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SubmissionValidator = require('../../../../app/validators/return-logs/setup/submission.validator.js')

describe('Return Logs Setup - Submission validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = SubmissionValidator.go({ journey: 'enterReturn' })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "journey" is given', () => {
      it('fails validation', () => {
        const result = SubmissionValidator.go({ journey: '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select what you want to do with this return')
      })
    })

    describe('because an unknown "type" is given', () => {
      it('fails validation', () => {
        const result = SubmissionValidator.go({ journey: 'invalid' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select what you want to do with this return')
      })
    })
  })
})
