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
          'abstraction-period-start-day': '01',
          'abstraction-period-start-month': '12',
          'abstraction-period-end-day': '02',
          'abstraction-period-end-month': '7'
        }
      })

      it('confirms the data is valid', () => {
        const result = AbstractionPeriodValidator.go(payload)

        expect(result.value['abstraction-period-start']).to.exist()
        expect(result.value['abstraction-period-end']).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('and the data is provided as numbers', () => {
      beforeEach(() => {
        payload = {
          'abstraction-period-start-day': 1,
          'abstraction-period-start-month': 12,
          'abstraction-period-end-day': 2,
          'abstraction-period-end-month': 7
        }
      })

      it('confirms the data is valid', () => {
        const result = AbstractionPeriodValidator.go(payload)

        expect(result.value['abstraction-period-start']).to.exist()
        expect(result.value['abstraction-period-end']).to.exist()
        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when invalid data is provided', () => {
    describe('for the start date, with a valid end date', () => {
      beforeEach(() => {
        payload = {
          'abstraction-period-start-day': 'INVALID_START_DAY',
          'abstraction-period-start-month': 'INVALID_START_MONTH',
          'abstraction-period-end-day': '02',
          'abstraction-period-end-month': '07'
        }
      })

      it('fails validation for only the start date', () => {
        const result = AbstractionPeriodValidator.go(payload)

        expect(result.value['abstraction-period-start']).to.exist()
        expect(result.value['abstraction-period-end']).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a real start date')
        expect(result.error.details.length).to.equal(1)
      })
    })

    describe('for the end date, with a valid start date', () => {
      beforeEach(() => {
        payload = {
          'abstraction-period-start-day': '01',
          'abstraction-period-start-month': '12',
          'abstraction-period-end-day': 'INVALID_END_DAY',
          'abstraction-period-end-month': 'INVALID_END_MONTH'
        }
      })

      it('fails validation for only the end date', () => {
        const result = AbstractionPeriodValidator.go(payload)

        expect(result.value['abstraction-period-start']).to.exist()
        expect(result.value['abstraction-period-end']).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a real end date')
        expect(result.error.details.length).to.equal(1)
      })
    })

    describe('for the start date, with no end date', () => {
      beforeEach(() => {
        payload = {
          'abstraction-period-start-day': 'INVALID_START_DAY',
          'abstraction-period-start-month': 'INVALID_START_MONTH',
          'abstraction-period-end-day': null,
          'abstraction-period-end-month': null
        }
      })

      it('fails validation correctly for both dates', () => {
        const result = AbstractionPeriodValidator.go(payload)

        expect(result.value['abstraction-period-start']).to.exist()
        expect(result.value['abstraction-period-end']).to.not.exist()
        expect(result.error.details[0].message).to.equal('Enter a real start date')
        expect(result.error.details[1].message).to.equal('Select the end date of the abstraction period')
        expect(result.error.details.length).to.equal(2)
      })
    })

    describe('for the end date, with no start date', () => {
      beforeEach(() => {
        payload = {
          'abstraction-period-start-day': null,
          'abstraction-period-start-month': null,
          'abstraction-period-end-day': 'INVALID_END_DAY',
          'abstraction-period-end-month': 'INVALID_END_MONTH'
        }
      })

      it('fails validation correctly for both dates', () => {
        const result = AbstractionPeriodValidator.go(payload)

        expect(result.value['abstraction-period-start']).to.not.exist()
        expect(result.value['abstraction-period-end']).to.exist()
        expect(result.error.details[0].message).to.equal('Select the start date of the abstraction period')
        expect(result.error.details[1].message).to.equal('Enter a real end date')
        expect(result.error.details.length).to.equal(2)
      })
    })

    describe('for both dates', () => {
      beforeEach(() => {
        payload = {
          'abstraction-period-start-day': 'INVALID_START_DAY',
          'abstraction-period-start-month': 'INVALID_START_MONTH',
          'abstraction-period-end-day': 'INVALID_END_DAY',
          'abstraction-period-end-month': 'INVALID_END_MONTH'
        }
      })

      it('fails validation correctly for both dates', () => {
        const result = AbstractionPeriodValidator.go(payload)

        expect(result.value['abstraction-period-start']).to.exist()
        expect(result.value['abstraction-period-end']).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a real start date')
        expect(result.error.details[1].message).to.equal('Enter a real end date')
        expect(result.error.details.length).to.equal(2)
      })
    })
  })

  describe('when only start abstraction period data is provided', () => {
    beforeEach(() => {
      payload = {
        'abstraction-period-start-day': '01',
        'abstraction-period-start-month': '12',
        'abstraction-period-end-day': null,
        'abstraction-period-end-month': null
      }
    })

    it('fails validation for only the end date', () => {
      const result = AbstractionPeriodValidator.go(payload)

      expect(result.value['abstraction-period-start']).to.exist()
      expect(result.value['abstraction-period-end']).to.not.exist()
      expect(result.error.details[0].message).to.equal('Select the end date of the abstraction period')
      expect(result.error.details.length).to.equal(1)
    })
  })

  describe('when only end abstraction period data is provided', () => {
    beforeEach(() => {
      payload = {
        'abstraction-period-start-day': null,
        'abstraction-period-start-month': null,
        'abstraction-period-end-day': '02',
        'abstraction-period-end-month': '7'
      }
    })

    it('fails validation for only the start date', () => {
      const result = AbstractionPeriodValidator.go(payload)

      expect(result.value['abstraction-period-start']).to.not.exist()
      expect(result.value['abstraction-period-end']).to.exist()
      expect(result.error.details[0].message).to.equal('Select the start date of the abstraction period')
      expect(result.error.details.length).to.equal(1)
    })
  })

  describe('when no data is provided', () => {
    beforeEach(() => {
      payload = {}
    })

    it('fails validation correctly for both dates', () => {
      const result = AbstractionPeriodValidator.go(payload)

      expect(result.value['abstraction-period-start']).to.not.exist()
      expect(result.value['abstraction-period-end']).to.not.exist()
      expect(result.error.details[0].message).to.equal('Select the start date of the abstraction period')
      expect(result.error.details[1].message).to.equal('Select the end date of the abstraction period')
      expect(result.error.details.length).to.equal(2)
    })
  })
})
