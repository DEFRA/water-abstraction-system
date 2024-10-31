'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Thing under test
const AbstractionPeriodValidator = require('../../../../app/validators/return-versions/setup/abstraction-period.validator.js')

describe('Return Versions Setup - Abstraction Period validator', () => {
  let payload

  describe('when valid data is provided', () => {
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

  describe('when invalid data is provided', () => {
    beforeEach(() => {
      payload = {
        'start-abstraction-period-day': 'abc',
        'start-abstraction-period-month': '123',
        'end-abstraction-period-day': 'def',
        'end-abstraction-period-month': '456'
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
