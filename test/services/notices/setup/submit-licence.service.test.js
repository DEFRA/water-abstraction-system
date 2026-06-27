'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Test helpers
const YarStub = require('../../../support/stubs/yar.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')
const ProcessRenewalsNoticeLicenceSubmission = require('../../../../app/services/notices/setup/renewal-notice/process-licence-submission.service.js')
const ProcessReturnsNoticeLicenceSubmission = require('../../../../app/services/notices/setup/returns-notice/process-licence-submission.service.js')

// Thing under test
const SubmitLicenceService = require('../../../../app/services/notices/setup/submit-licence.service.js')

describe('Notices - Setup - Submit Licence service', () => {
  let clock
  let fetchSessionStub
  let licenceRef
  let payload
  let processRenewalsNoticeLicenceSubmissionStub
  let processReturnsNoticeLicenceSubmissionStub
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    licenceRef = generateLicenceRef()

    clock = Sinon.useFakeTimers(new Date('2020-06-06'))

    sessionData = {}

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    processReturnsNoticeLicenceSubmissionStub = Sinon.stub(ProcessReturnsNoticeLicenceSubmission, 'go').resolves({
      additionalSessionData: { dueReturns: [] },
      validationResult: null
    })

    processRenewalsNoticeLicenceSubmissionStub = Sinon.stub(ProcessRenewalsNoticeLicenceSubmission, 'go').resolves({
      additionalSessionData: {},
      validationResult: null
    })

    yarStub = YarStub.build(Sinon)
  })

  afterEach(() => {
    clock.restore()
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { licenceRef }
      })

      it('saves the submitted value', async () => {
        await SubmitLicenceService.go(session.id, payload, yarStub)

        expect(session.licenceRef).toEqual(licenceRef)
        expect(session.$update.called).toBe(true)
      })

      it('returns the redirect url', async () => {
        const result = await SubmitLicenceService.go(session.id, payload, yarStub)

        expect(result).toEqual({ redirectUrl: 'check-notice-type' })
      })

      describe('for a "paper return" notice type', () => {
        describe('and the check page has not been visited', () => {
          beforeEach(() => {
            sessionData = { noticeType: 'paperReturn', checkPageVisited: false }

            session = SessionModelStub.build(Sinon, sessionData)

            fetchSessionStub.resolves(session)
          })

          it('returns a redirect to the "paper-return" page', async () => {
            const result = await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(result).toEqual({ redirectUrl: 'paper-return' })
          })
        })

        describe('and the check page has been visited', () => {
          beforeEach(() => {
            sessionData = { noticeType: 'paperReturn', licenceRef, checkPageVisited: true }

            session = SessionModelStub.build(Sinon, sessionData)

            fetchSessionStub.resolves(session)
          })

          it('returns a redirect to the "check-notice-type" page', async () => {
            const result = await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(result).toEqual({ redirectUrl: 'check-notice-type' })
          })
        })
      })

      describe('for a "renewal invitation" notice type', () => {
        beforeEach(() => {
          sessionData = { checkPageVisited: false, noticeType: 'renewalInvitations' }

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('calls the "processRenewalsNoticeLicenceSubmissionStub"', async () => {
          await SubmitLicenceService.go(session.id, payload, yarStub)

          expect(processRenewalsNoticeLicenceSubmissionStub.calledOnceWithExactly(payload)).toBe(true)
        })

        describe('and the check page has not been visited', () => {
          it('returns a redirect to the "check-notice-type" page', async () => {
            const result = await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(result).toEqual({ redirectUrl: 'check-notice-type' })
          })
        })

        describe('and the check page has been visited', () => {
          beforeEach(() => {
            sessionData = { checkPageVisited: true, licenceRef, noticeType: 'renewalInvitations' }

            session = SessionModelStub.build(Sinon, sessionData)

            fetchSessionStub.resolves(session)
          })

          it('returns a redirect to the "check-notice-type" page', async () => {
            const result = await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(result).toEqual({ redirectUrl: 'check-notice-type' })
          })
        })
      })

      describe('and the journey is for "standard"', () => {
        describe('and the check page has been visited', () => {
          beforeEach(() => {
            sessionData = { journey: 'standard', licenceRef, checkPageVisited: true }

            session = SessionModelStub.build(Sinon, sessionData)

            fetchSessionStub.resolves(session)
          })

          it('returns a redirect to the "check-notice-type" page', async () => {
            const result = await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(result).toEqual({ redirectUrl: 'check-notice-type' })
          })
        })

        describe('and the check page has not been visited', () => {
          beforeEach(() => {
            sessionData = { journey: 'standard', checkPageVisited: false }

            session = SessionModelStub.build(Sinon, sessionData)

            fetchSessionStub.resolves(session)
          })

          it('returns a redirect to the "returns-period" page', async () => {
            const result = await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(result).toEqual({ redirectUrl: 'returns-period' })
          })
        })
      })

      describe('from the check page', () => {
        describe('and the licence ref has been updated', () => {
          beforeEach(() => {
            sessionData = { licenceRef: '01/11', checkPageVisited: true }

            session = SessionModelStub.build(Sinon, sessionData)

            fetchSessionStub.resolves(session)
          })

          it('redirects to the check notice type page', async () => {
            const result = await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(result.redirectUrl).toEqual('check-notice-type')
          })

          it('updates the sessions "checkPageVisited" flag', async () => {
            await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(session.checkPageVisited).toBe(false)
          })

          it('sets a flash message', async () => {
            await SubmitLicenceService.go(session.id, payload, yarStub)

            const [flashType, bannerMessage] = yarStub.flash.args[0]

            expect(flashType).toEqual('notification')
            expect(bannerMessage).toEqual({
              text: 'Licence number updated',
              titleText: 'Updated'
            })
          })
        })

        describe('and the licence ref has not been updated', () => {
          beforeEach(() => {
            sessionData = { licenceRef, checkPageVisited: true }

            session = SessionModelStub.build(Sinon, sessionData)

            fetchSessionStub.resolves(session)
          })

          it('redirects to the check notice type page', async () => {
            const result = await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(result.redirectUrl).toEqual('check-notice-type')
          })

          it('does not set a flash message', async () => {
            await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(yarStub.flash.args[0]).toBeUndefined()
          })
        })
      })
    })

    describe('fails validation', () => {
      beforeEach(() => {
        payload = {}

        processReturnsNoticeLicenceSubmissionStub.resolves({
          additionalSessionData: { dueReturns: [] },
          validationResult: {
            errorList: [{ href: '#licenceRef', text: 'Enter a licence number' }],
            licenceRef: { text: 'Enter a licence number' }
          }
        })
      })

      it('returns page data needed to re-render the view including the validation error', async () => {
        const result = await SubmitLicenceService.go(session.id, payload, yarStub)

        expect(result).toEqual({
          activeNavBar: 'notices',
          backLink: {
            href: `/system/notices/setup/${session.id}/notice-type`,
            text: 'Back'
          },
          error: {
            errorList: [{ href: '#licenceRef', text: 'Enter a licence number' }],
            licenceRef: { text: 'Enter a licence number' }
          },
          licenceRef: null,
          pageTitle: 'Enter a licence number'
        })
      })
    })
  })
})
