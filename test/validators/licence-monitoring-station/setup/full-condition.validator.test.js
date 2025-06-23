'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const FullConditionValidator = require('../../../../app/validators/licence-monitoring-station/setup/full-condition.validator.js')

describe('Full Condition Validator', () => {
  let payload

  describe('when called with valid data', () => {
    describe('a uuid', () => {
      beforeEach(() => {
        payload = {
          condition: '2c7d8751-6c78-4958-bb88-02bf7801e818'
        }
      })

      it('returns with no errors', () => {
        const result = FullConditionValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('the string not_listed', () => {
      beforeEach(() => {
        payload = {
          condition: 'not_listed'
        }
      })

      it('returns with no errors', () => {
        const result = FullConditionValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when called with invalid data', () => {
    describe('a payload without condition', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = FullConditionValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select a condition')
      })
    })

    describe('a payload with an invalid value', () => {
      beforeEach(() => {
        payload = {
          condition: 'INVALID'
        }
      })

      it('returns with errors', () => {
        const result = FullConditionValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('"condition" must be a valid GUID')
      })
    })
  })
})
