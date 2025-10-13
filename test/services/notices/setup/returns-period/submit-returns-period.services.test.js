'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, after, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')
const { generateReferenceCode } = require('../../../../support/helpers/notification.helper.js')

// Thing under test
const SubmitReturnsPeriodService = require('../../../../../app/services/notices/setup/returns-period/submit-returns-period.service.js')

describe('Notices - Setup - Submit Returns Period service', () => {
  let clock
  let payload
  let referenceCode
  let session

  before(async () => {
    referenceCode = generateReferenceCode()

    const testDate = new Date('2024-12-01')

    clock = Sinon.useFakeTimers(testDate)
  })

  after(() => {
    clock.restore()
  })

  describe('when submitting as returns period ', () => {
    describe('is successful', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({ data: { referenceCode, noticeType: 'invitations' } })

        payload = { returnsPeriod: 'quarterFour' }
      })

      it('saves the submitted value', async () => {
        await SubmitReturnsPeriodService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.returnsPeriod).to.equal('quarterFour')
      })

      it('saves the determined returns period', async () => {
        await SubmitReturnsPeriodService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.determinedReturnsPeriod).to.equal({
          dueDate: '2025-04-28T00:00:00.000Z',
          endDate: '2025-03-31T00:00:00.000Z',
          name: 'quarterFour',
          startDate: '2025-01-01T00:00:00.000Z',
          summer: 'false'
        })
      })

      it('returns the redirect route', async () => {
        const result = await SubmitReturnsPeriodService.go(session.id, payload)

        expect(result).to.equal({
          redirect: `${session.id}/check-notice-type`
        })
      })
    })

    describe('fails validation', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({
          data: { referenceCode, journey: 'invitations', noticeType: 'invitations' }
        })
        payload = {}
      })

      it('correctly presents the data with the error', async () => {
        const result = await SubmitReturnsPeriodService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'manage',
          backLink: {
            href: `/system/notices/setup/${session.id}/notice-type`,
            text: 'Back'
          },
          error: {
            errorList: [
              {
                href: '#returnsPeriod',
                text: 'Select the returns periods for the invitations'
              }
            ],
            returnsPeriod: {
              text: 'Select the returns periods for the invitations'
            }
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
})
