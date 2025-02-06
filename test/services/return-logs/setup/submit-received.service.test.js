'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitReceivedService = require('../../../../app/services/return-logs/setup/submit-received.service.js')

describe('Return Logs Setup - Submit Received service', () => {
  let payload
  let session
  let sessionData
  let testDate
  let yarStub

  beforeEach(async () => {
    sessionData = {
      data: {
        returnReference: '12345',
        startDate: '2023-04-01T00:00:00.000Z',
        licenceId: 'cd190dc7-912a-46a5-9421-2750fb1c7ac8'
      }
    }

    session = await SessionHelper.add(sessionData)

    yarStub = { flash: Sinon.stub() }
  })

  describe('when called', () => {
    describe('with a valid payload (todays date)', () => {
      beforeEach(async () => {
        testDate = new Date()
        testDate.setHours(0, 0, 0, 0)
        payload = {
          'received-date-options': 'today'
        }
      })

      it('saves the submitted option', async () => {
        await SubmitReceivedService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.receivedDateOptions).to.equal('today')
        expect(new Date(refreshedSession.receivedDate)).to.equal(testDate)
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitReceivedService.go(session.id, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: undefined
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { ...sessionData.data, checkPageVisited: true } })
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitReceivedService.go(session.id, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: true
          })
        })

        it('sets the notification message title to "Updated" and the text to "Changes made" ', async () => {
          await SubmitReceivedService.go(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Changes made' })
        })
      })
    })

    describe('with a valid payload (yesterdays date)', () => {
      beforeEach(async () => {
        testDate = new Date()
        testDate.setDate(testDate.getDate() - 1)
        testDate.setHours(0, 0, 0, 0)
        payload = {
          'received-date-options': 'yesterday'
        }
      })

      it('saves the submitted option', async () => {
        await SubmitReceivedService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.receivedDateOptions).to.equal('yesterday')
        expect(new Date(refreshedSession.receivedDate)).to.equal(testDate)
      })
    })

    describe('with a valid payload (custom received date)', () => {
      beforeEach(async () => {
        payload = {
          'received-date-options': 'custom-date',
          'received-date-day': '26',
          'received-date-month': '11',
          'received-date-year': '2023'
        }
      })

      it('saves the submitted values', async () => {
        await SubmitReceivedService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.receivedDateOptions).to.equal('custom-date')
        expect(refreshedSession.receivedDateDay).to.equal('26')
        expect(refreshedSession.receivedDateMonth).to.equal('11')
        expect(refreshedSession.receivedDateYear).to.equal('2023')
        expect(new Date(refreshedSession.receivedDate)).to.equal(new Date('2023-11-26'))
      })

      it('returns the correct details the controller needs to redirect the journey', async () => {
        const result = await SubmitReceivedService.go(session.id, payload, yarStub)

        expect(result).to.equal({ checkPageVisited: undefined })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitReceivedService.go(session.id, payload, yarStub)

        expect(result).to.equal(
          {
            activeNavBar: 'search',
            pageTitle: 'When was the return received?',
            receivedDateDay: null,
            receivedDateMonth: null,
            receivedDateYear: null,
            receivedDateOption: null,
            backLink: `/system/licences/cd190dc7-912a-46a5-9421-2750fb1c7ac8/returns`,
            returnReference: '12345'
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitReceivedService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({
            message: 'Select the return received date',
            radioFormElement: { text: 'Select the return received date' },
            dateInputFormElement: null
          })
        })
      })

      describe('because the user has selected custom received date and entered invalid data', () => {
        beforeEach(async () => {
          payload = {
            'received-date-options': 'custom-date',
            'received-date-day': 'a',
            'received-date-month': 'b',
            'received-date-year': 'c'
          }
        })

        it('includes an error for the date input element', async () => {
          const result = await SubmitReceivedService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({
            message: 'Enter a real received date',
            radioFormElement: null,
            dateInputFormElement: { text: 'Enter a real received date' }
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitReceivedService.go(session.id, payload, yarStub)

          expect(result.receivedDateDay).to.equal('a')
          expect(result.receivedDateMonth).to.equal('b')
          expect(result.receivedDateYear).to.equal('c')
          expect(result.receivedDateOption).to.equal('custom-date')
        })
      })
    })
  })
})
