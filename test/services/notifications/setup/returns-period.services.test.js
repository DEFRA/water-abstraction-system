'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReturnsPeriodService = require('../../../../app/services/notifications/setup/returns-period.service.js')

describe('Notifications Setup - Returns Period service', () => {
  let clock

  before(() => {
    const testDate = new Date('2024-12-01')

    clock = Sinon.useFakeTimers(testDate)
  })

  after(() => {
    clock.restore()
  })

  describe('when provided no params', () => {
    it('correctly presents the data', () => {
      const result = ReturnsPeriodService.go()

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: '/manage',
        pageTitle: 'Select the returns periods for the invitations',
        returnsPeriod: [
          {
            hint: {
              text: 'Due date 28 January 2025'
            },
            text: 'Quarterly 1 October 2024 to 31 December 2024',
            value: 'quarterFour'
          },
          {
            hint: {
              text: 'Due date 28 April 2025'
            },
            text: 'Quarterly 1 January 2025 to 31 March 2025',
            value: 'quarterOne'
          }
        ]
      })
    })
  })
})
