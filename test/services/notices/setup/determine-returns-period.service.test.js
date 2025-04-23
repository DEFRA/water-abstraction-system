'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const DetermineReturnsPeriodService = require('../../../../app/services/notices/setup/determine-returns-period.service.js')

describe('Notices - Setup - Determine returns period service', () => {
  const year = 2025

  let clock
  let returnsPeriod

  before(async () => {
    clock = Sinon.useFakeTimers(new Date(`${year}-01-01`))

    returnsPeriod = 'quarterFour'
  })

  afterEach(() => {
    clock.restore()
  })

  describe('when the returns period is not for summer', () => {
    it('should return the returns period and summer "false"', () => {
      const result = DetermineReturnsPeriodService.go(returnsPeriod)

      expect(result).to.equal({
        returnsPeriod: {
          dueDate: new Date('2025-04-28'),
          endDate: new Date('2025-03-31'),
          name: 'quarterFour',
          startDate: new Date('2025-01-01')
        },
        summer: 'false'
      })
    })
  })

  describe('when the returns period is for summer', () => {
    beforeEach(async () => {
      returnsPeriod = 'summer'
    })

    it('should return the returns period and summer "true"', () => {
      const result = DetermineReturnsPeriodService.go(returnsPeriod)

      expect(result).to.equal({
        returnsPeriod: {
          dueDate: new Date('2025-11-28'),
          endDate: new Date('2025-10-31'),
          name: 'summer',
          startDate: new Date('2024-11-01')
        },
        summer: 'true'
      })
    })
  })
})
