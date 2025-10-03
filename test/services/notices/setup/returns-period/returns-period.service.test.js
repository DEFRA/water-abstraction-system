'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')
const { generateReferenceCode } = require('../../../../support/helpers/notification.helper.js')

// Thing under test
const ReturnsPeriodService = require('../../../../../app/services/notices/setup/returns-period/returns-period.service.js')

describe('Notices - Setup - Returns Period service', () => {
  let clock
  let referenceCode
  let session

  before(async () => {
    referenceCode = generateReferenceCode()
    session = await SessionHelper.add({ data: { referenceCode, journey: 'invitations' } })

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
        backLink: {
          href: '/manage',
          text: 'Back'
        },
        pageTitle: 'Select the returns periods for the invitations',
        pageTitleCaption: `Notice ${referenceCode}`,
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
