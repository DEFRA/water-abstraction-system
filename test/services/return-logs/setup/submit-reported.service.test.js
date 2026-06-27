'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const YarStub = require('../../../support/stubs/yar.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitReportedService = require('../../../../app/services/return-logs/setup/submit-reported.service.js')

describe('Return Logs Setup - Submit Reported service', () => {
  let fetchSessionStub
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      returnReference: '12345'
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
        payload = { reported: 'meterReadings' }
      })

      it('saves the submitted option', async () => {
        await SubmitReportedService.go(session.id, payload, yarStub)

        expect(session.reported).toEqual('meterReadings')
        expect(session.$update.called).toBe(true)
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitReportedService.go(session.id, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: undefined,
            reported: 'meterReadings'
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(() => {
          session = SessionModelStub.build(Sinon, { ...sessionData, checkPageVisited: true })

          fetchSessionStub.resolves(session)
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitReportedService.go(session.id, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: true,
            reported: 'meterReadings'
          })
        })

        it('sets the notification message title to "Updated" and the text to "Reporting details changed" ', async () => {
          await SubmitReportedService.go(session.id, payload, yarStub)

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
        const result = await SubmitReportedService.go(session.id, payload, yarStub)

        expect(result).toMatchObject({
          backLink: { href: `/system/return-logs/setup/${session.id}/submission`, text: 'Back' },
          reported: null,
          pageTitle: 'How was this return reported?',
          pageTitleCaption: 'Return reference 12345'
        })
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitReportedService.go(session.id, payload, yarStub)

          expect(result.error.errorList).toEqual([{ href: '#reported', text: 'Select how this return was reported' }])
        })
      })
    })
  })
})
