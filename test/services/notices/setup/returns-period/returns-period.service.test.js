'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Thing under test
const ReturnsPeriodService = require('../../../../../app/services/notices/setup/returns-period/returns-period.service.js')

describe('Notices - Setup - Returns Period service', () => {
  let clock
  let session

  before(async () => {
    session = await SessionHelper.add({ data: { referenceCode: 'RINV-123' } })

    const testDate = new Date('2024-12-01')

    clock = Sinon.useFakeTimers(testDate)
  })

  after(() => {
    clock.restore()
  })

  describe('when provided no params', () => {
    it('correctly presents the data', async () => {
      const result = await ReturnsPeriodService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: '/manage',
        pageTitle: 'Select the returns periods for the invitations',
        referenceCode: 'RINV-123',
        returnsPeriod: [
          {
            checked: false,
            hint: {
              text: 'Due date 28 January 2025'
            },
            text: 'Quarterly 1 October 2024 to 31 December 2024',
            value: 'quarterThree'
          },
          {
            checked: false,
            hint: {
              text: 'Due date 28 April 2025'
            },
            text: 'Quarterly 1 January 2025 to 31 March 2025',
            value: 'quarterFour'
          }
        ]
      })
    })
  })
})
