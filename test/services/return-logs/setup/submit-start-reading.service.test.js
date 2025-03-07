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
const SubmitStartReadingService = require('../../../../app/services/return-logs/setup/submit-start-reading.service.js')

describe('Return Logs Setup - Submit Start Reading service', () => {
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    sessionData = {
      data: {
        returnReference: '12345',
        lines: [
          {
            endDate: '2019-04-30T00:00:00.000Z',
            startDate: '2019-04-01T00:00:00.000Z'
          },
          {
            endDate: '2019-05-31T00:00:00.000Z',
            startDate: '2019-05-01T00:00:00.000Z'
          }
        ]
      }
    }

    session = await SessionHelper.add(sessionData)

    yarStub = { flash: Sinon.stub() }
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        payload = { startReading: '15600' }
      })

      it('saves the submitted option', async () => {
        await SubmitStartReadingService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.startReading).to.equal(15600)
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitStartReadingService.go(session.id, payload, yarStub)

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
          const result = await SubmitStartReadingService.go(session.id, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: true
          })
        })

        it('sets the notification message title to "Updated" and the text to "Changes made" ', async () => {
          await SubmitStartReadingService.go(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Changes made' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitStartReadingService.go(session.id, payload, yarStub)

        expect(result).to.equal(
          {
            pageTitle: 'Enter the start meter reading',
            activeNavBar: 'search',
            startReading: null,
            backLink: `/system/return-logs/setup/${session.id}/reported`,
            returnReference: '12345'
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitStartReadingService.go(session.id, payload, yarStub)

          expect(result.error).to.equal({ text: 'Enter a start meter reading' })
        })
      })
    })
  })
})
