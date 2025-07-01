'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AbstractionPeriodValidator = require('../../app/validators/abstraction-period.validator.js')

describe('Abstraction Period validator', () => {
  let payload

  describe('when valid data is provided', () => {
    describe('and the data is provided as strings', () => {
      beforeEach(() => {
        payload = {
          'start-abstraction-period-day': '01',
          'start-abstraction-period-month': '12',
          'end-abstraction-period-day': '02',
          'end-abstraction-period-month': '7'
        }
      })

      it('confirms the data is valid', () => {
        const result = AbstractionPeriodValidator.go(payload)

        expect(result.startResult.value).to.exist()
        expect(result.endResult.value).to.exist()
        expect(result.startResult.error).not.to.exist()
        expect(result.endResult.error).not.to.exist()
      })
    })

    describe('and the data is provided as numbers', () => {
      beforeEach(() => {
        payload = {
          'start-abstraction-period-day': 1,
          'start-abstraction-period-month': 12,
          'end-abstraction-period-day': 2,
          'end-abstraction-period-month': 7
        }
      })

      it('confirms the data is valid', () => {
        const result = AbstractionPeriodValidator.go(payload)

        expect(result.startResult.value).to.exist()
        expect(result.endResult.value).to.exist()
        expect(result.startResult.error).not.to.exist()
        expect(result.endResult.error).not.to.exist()
      })
    })
  })

  describe('when invalid data is provided', () => {
    describe('for the start date, with a valid end date', () => {
      beforeEach(() => {
        payload = {
          'start-abstraction-period-day': 'INVALID_START_DAY',
          'start-abstraction-period-month': 'INVALID_START_MONTH',
          'end-abstraction-period-day': '02',
          'end-abstraction-period-month': '07'
        }
      })

      it('fails validation', () => {
        const result = AbstractionPeriodValidator.go(payload)

        expect(result.startResult.value).to.exist()
        expect(result.startResult.error.details[0].message).to.equal('Enter a real start date')
        expect(result.endResult.value).to.exist()
        expect(result.endResult.error).to.not.exist()
      })
    })

    describe('for the end date, with a valid start date', () => {
      beforeEach(() => {
        payload = {
          'start-abstraction-period-day': '01',
          'start-abstraction-period-month': '12',
          'end-abstraction-period-day': 'INVALID_END_DAY',
          'end-abstraction-period-month': 'INVALID_END_MONTH'
        }
      })

      it('fails validation', () => {
        const result = AbstractionPeriodValidator.go(payload)

        expect(result.startResult.value).to.exist()
        expect(result.startResult.error).to.not.exist()
        expect(result.endResult.value).to.exist()
        expect(result.endResult.error.details[0].message).to.equal('Enter a real end date')
      })
    })

    describe('for the start date, with no end date', () => {
      beforeEach(() => {
        payload = {
          'start-abstraction-period-day': 'INVALID_START_DAY',
          'start-abstraction-period-month': 'INVALID_START_MONTH',
          'end-abstraction-period-day': null,
          'end-abstraction-period-month': null
        }
      })

      it('fails validation', () => {
        const result = AbstractionPeriodValidator.go(payload)

        expect(result.startResult.value).to.exist()
        expect(result.endResult.value).to.exist()
        expect(result.startResult.error.details[0].message).to.equal('Enter a real start date')
        expect(result.endResult.error.details[0].message).to.equal('Select the end date of the abstraction period')
      })
    })

    describe('for the end date, with no start date', () => {
      beforeEach(() => {
        payload = {
          'start-abstraction-period-day': null,
          'start-abstraction-period-month': null,
          'end-abstraction-period-day': 'INVALID_END_DAY',
          'end-abstraction-period-month': 'INVALID_END_MONTH'
        }
      })

      it('fails validation', () => {
        const result = AbstractionPeriodValidator.go(payload)

        expect(result.startResult.value).to.exist()
        expect(result.endResult.value).to.exist()
        expect(result.startResult.error.details[0].message).to.equal('Select the start date of the abstraction period')
        expect(result.endResult.error.details[0].message).to.equal('Enter a real end date')
      })
    })

    describe('for both dates', () => {
      beforeEach(() => {
        payload = {
          'start-abstraction-period-day': 'INVALID_START_DAY',
          'start-abstraction-period-month': 'INVALID_START_MONTH',
          'end-abstraction-period-day': 'INVALID_END_DAY',
          'end-abstraction-period-month': 'INVALID_END_MONTH'
        }
      })

      it('fails validation', () => {
        const result = AbstractionPeriodValidator.go(payload)

        expect(result.startResult.value).to.exist()
        expect(result.endResult.value).to.exist()
        expect(result.startResult.error.details[0].message).to.equal('Enter a real start date')
        expect(result.endResult.error.details[0].message).to.equal('Enter a real end date')
      })
    })
  })

  describe('when only start abstraction period data is provided', () => {
    beforeEach(() => {
      payload = {
        'start-abstraction-period-day': '01',
        'start-abstraction-period-month': '12',
        'end-abstraction-period-day': null,
        'end-abstraction-period-month': null
      }
    })

    it('fails validation', () => {
      const result = AbstractionPeriodValidator.go(payload)

      expect(result.startResult.value).to.exist()
      expect(result.endResult.value).to.exist()
      expect(result.startResult.error).not.to.exist()
      expect(result.endResult.error.details[0].message).to.equal('Select the end date of the abstraction period')
    })
  })

  describe('when only end abstraction period data is provided', () => {
    beforeEach(() => {
      payload = {
        'start-abstraction-period-day': null,
        'start-abstraction-period-month': null,
        'end-abstraction-period-day': '02',
        'end-abstraction-period-month': '7'
      }
    })

    it('fails validation', () => {
      const result = AbstractionPeriodValidator.go(payload)

      expect(result.startResult.value).to.exist()
      expect(result.endResult.value).to.exist()
      expect(result.startResult.error.details[0].message).to.equal('Select the start date of the abstraction period')
      expect(result.endResult.error).not.to.exist()
    })
  })

  describe('when no data is provided', () => {
    beforeEach(() => {
      payload = {}
    })

    it('fails validation', () => {
      const result = AbstractionPeriodValidator.go(payload)

      expect(result.startResult.value).to.exist()
      expect(result.endResult.value).to.exist()
      expect(result.startResult.error.details[0].message).to.equal('Select the start date of the abstraction period')
      expect(result.endResult.error.details[0].message).to.equal('Select the end date of the abstraction period')
    })
  })
})
