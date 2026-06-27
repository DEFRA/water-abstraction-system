'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const YarStub = require('../../../support/stubs/yar.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitStartReadingService = require('../../../../app/services/return-logs/setup/submit-start-reading.service.js')

describe('Return Logs Setup - Submit Start Reading service', () => {
  let fetchSessionStub
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
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

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = YarStub.build(Sinon)
    yarStub.flash.returns([])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { startReading: '15600' }
      })

      it('saves the submitted option', async () => {
        await SubmitStartReadingService.go(session.id, payload, yarStub)

        expect(session.startReading).toEqual(15600)
        expect(session.$update.called).toBe(true)
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitStartReadingService.go(session.id, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: undefined
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(() => {
          session = SessionModelStub.build(Sinon, { ...sessionData, checkPageVisited: true })

          fetchSessionStub.resolves(session)
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitStartReadingService.go(session.id, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: true
          })
        })

        it('sets the notification message title to "Updated" and the text to "Reporting details changed" ', async () => {
          await SubmitStartReadingService.go(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({ titleText: 'Updated', text: 'Reporting details changed' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitStartReadingService.go(session.id, payload, yarStub)

        expect(result).toMatchObject({
          backLink: { href: `/system/return-logs/setup/${session.id}/reported`, text: 'Back' },
          startReading: null,
          pageTitle: 'Enter the start meter reading',
          pageTitleCaption: 'Return reference 12345'
        })
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitStartReadingService.go(session.id, payload, yarStub)

          expect(result.error.errorList).toEqual([{ text: 'Enter a start meter reading', href: '#startReading' }])
        })
      })
    })
  })
})
