'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, after, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitReturnsPeriodService = require('../../../../app/services/notifications/setup/submit-returns-period.service.js')

describe('Notifications Setup - Submit Returns Period service', () => {
  let clock
  let payload
  let session

  before(async () => {
    const testDate = new Date('2024-12-01')

    clock = Sinon.useFakeTimers(testDate)
  })

  after(() => {
    clock.restore()
  })
  describe('when submitting as returns period ', () => {
    describe('is successful', () => {
      beforeEach(async () => {
        session = await SessionHelper.add()

        payload = { returnsPeriod: 'quarterFour' }
      })

      it('saves the submitted value', async () => {
        await SubmitReturnsPeriodService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.returnsPeriod).to.equal('quarterFour')
      })

      it('returns the redirect route', async () => {
        const result = await SubmitReturnsPeriodService.go(session.id, payload)

        expect(result).to.equal({
          redirect: 'send-notice'
        })
      })
    })

    describe('fails validation', () => {
      beforeEach(async () => {
        session = await SessionHelper.add()
        payload = {}
      })
      it('correctly presents the data with the error', async () => {
        const result = await SubmitReturnsPeriodService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'manage',
          backLink: '/manage',
          error: {
            text: 'Select the returns periods for the invitations'
          },
          pageTitle: 'Select the returns periods for the invitations',
          returnsPeriod: [
            {
              checked: false,
              hint: {
                text: 'Due date 28 January 2025'
              },
              text: 'Quarterly 1 October 2024 to 31 December 2024',
              value: 'quarterFour'
            },
            {
              checked: false,
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
})