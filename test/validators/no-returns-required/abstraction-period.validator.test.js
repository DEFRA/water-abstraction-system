'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const AbstractionPeriodValidator = require('../../../app/validators/return-requirements/abstraction-period.validator.js')

describe('Abstraction Period validator', () => {
  describe('when valid data is provided', () => {
    const payload = {
      'from-abstraction-period-day': '01',
      'from-abstraction-period-month': '12',
      'to-abstraction-period-day': '02',
      'to-abstraction-period-month': '7'
    }

    it('confirms the data is valid', () => {
      const result = AbstractionPeriodValidator.go(payload)

      expect(result.fromResult.value).to.exist()
      expect(result.toResult.value).to.exist()
      expect(result.fromResult.error).not.to.exist()
      expect(result.toResult.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    const payload = {
      'from-abstraction-period-day': 'abc',
      'from-abstraction-period-month': '123',
      'to-abstraction-period-day': 'def',
      'to-abstraction-period-month': '456'
    }

    it('fails validation', () => {
      const result = AbstractionPeriodValidator.go(payload)

      expect(result.fromResult.value).to.exist()
      expect(result.toResult.value).to.exist()
      expect(result.fromResult.error.details[0].message).to.equal('Enter a real from date')
      expect(result.toResult.error.details[0].message).to.equal('Enter a real to date')
    })
  })

  describe('when only from abstraction period data is provided', () => {
    const payload = {
      'from-abstraction-period-day': '01',
      'from-abstraction-period-month': '12',
      'to-abstraction-period-day': null,
      'to-abstraction-period-month': null
    }

    it('fails validation', () => {
      const result = AbstractionPeriodValidator.go(payload)

      expect(result.fromResult.value).to.exist()
      expect(result.toResult.value).to.exist()
      expect(result.fromResult.error).not.to.exist()
      expect(result.toResult.error.details[0].message).to.equal('Select the to date of the abstraction period')
    })
  })

  describe('when only to abstraction period data is provided', () => {
    const payload = {
      'from-abstraction-period-day': null,
      'from-abstraction-period-month': null,
      'to-abstraction-period-day': '02',
      'to-abstraction-period-month': '7'
    }

    it('fails validation', () => {
      const result = AbstractionPeriodValidator.go(payload)

      expect(result.fromResult.value).to.exist()
      expect(result.toResult.value).to.exist()
      expect(result.fromResult.error.details[0].message).to.equal('Select the from date of the abstraction period')
      expect(result.toResult.error).not.to.exist()
    })
  })

  describe('when no data is provided', () => {
    const payload = {}

    it('fails validation', () => {
      const result = AbstractionPeriodValidator.go(payload)

      expect(result.fromResult.value).to.exist()
      expect(result.toResult.value).to.exist()
      expect(result.fromResult.error.details[0].message).to.equal('Select the from date of the abstraction period')
      expect(result.toResult.error.details[0].message).to.equal('Select the to date of the abstraction period')
    })
  })
})
