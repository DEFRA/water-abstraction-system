'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AbstractionPeriodValidator = require('../../../../app/validators/licence-monitoring-station/setup/abstraction-period.validator.js')

describe('Abstraction Period Validator', () => {
  let payload

  describe('when called with valid data', () => {
    beforeEach(() => {
      payload = {
        'abstraction-period-start-day': '1',
        'abstraction-period-start-month': '2',
        'abstraction-period-end-day': '3',
        'abstraction-period-end-month': '4'
      }
    })

    it('returns with no errors', () => {
      const { startResult, endResult } = AbstractionPeriodValidator.go(payload)

      expect(startResult.value).to.exist()
      expect(startResult.error).not.to.exist()
      expect(endResult.value).to.exist()
      expect(endResult.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    describe('like an invalid date', () => {
      beforeEach(() => {
        payload = {
          'abstraction-period-start-day': '99',
          'abstraction-period-start-month': '2',
          'abstraction-period-end-day': '99',
          'abstraction-period-end-month': '4'
        }
      })

      it('returns with errors', () => {
        const { startResult, endResult } = AbstractionPeriodValidator.go(payload)

        expect(startResult.value).to.exist()
        expect(startResult.error).to.exist()
        expect(startResult.error.details[0].message).to.equal('Enter a valid start date')

        expect(endResult.value).to.exist()
        expect(endResult.error).to.exist()
        expect(endResult.error.details[0].message).to.equal('Enter a valid end date')
      })
    })

    describe('like invalid chars', () => {
      beforeEach(() => {
        payload = {
          'abstraction-period-start-day': 'INVALID',
          'abstraction-period-start-month': 'INVALID',
          'abstraction-period-end-day': 'INVALID',
          'abstraction-period-end-month': 'INVALID'
        }
      })

      it('returns with errors', () => {
        const { startResult, endResult } = AbstractionPeriodValidator.go(payload)

        expect(startResult.value).to.exist()
        expect(startResult.error).to.exist()
        expect(startResult.error.details[0].message).to.equal('Enter a valid start date')

        expect(endResult.value).to.exist()
        expect(endResult.error).to.exist()
        expect(endResult.error.details[0].message).to.equal('Enter a valid end date')
      })
    })

    describe('like a missing date', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const { startResult, endResult } = AbstractionPeriodValidator.go(payload)

        expect(startResult.value).to.exist()
        expect(startResult.error).to.exist()
        expect(startResult.error.details[0].message).to.equal('Enter the abstraction period start date')

        expect(endResult.value).to.exist()
        expect(endResult.error).to.exist()
        expect(endResult.error.details[0].message).to.equal('Enter the abstraction period end date')
      })
    })

    describe('and only the start date is invalid', () => {
      it('only returns an error for the start date', () => {
        payload = {
          'abstraction-period-start-day': '99',
          'abstraction-period-start-month': '2',
          'abstraction-period-end-day': '3',
          'abstraction-period-end-month': '4'
        }

        const { startResult, endResult } = AbstractionPeriodValidator.go(payload)

        expect(startResult.value).to.exist()
        expect(startResult.error).to.exist()
        expect(startResult.error.details[0].message).to.equal('Enter a valid start date')

        expect(endResult.value).to.exist()
        expect(endResult.error).not.to.exist()
      })
    })

    describe('and only the end date is invalid', () => {
      it('only returns an error for the end date', () => {
        payload = {
          'abstraction-period-start-day': '1',
          'abstraction-period-start-month': '2',
          'abstraction-period-end-day': '99',
          'abstraction-period-end-month': '4'
        }

        const { startResult, endResult } = AbstractionPeriodValidator.go(payload)

        expect(startResult.value).to.exist()
        expect(startResult.error).not.to.exist()

        expect(endResult.value).to.exist()
        expect(endResult.error).to.exist()
        expect(endResult.error.details[0].message).to.equal('Enter a valid end date')
      })
    })
  })
})
