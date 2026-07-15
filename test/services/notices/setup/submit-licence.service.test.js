// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'

// Test helpers
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'
import * as ProcessRenewalsNoticeLicenceSubmission from '../../../../app/services/notices/setup/renewal-notice/process-licence-submission.service.js'
import * as ProcessReturnsNoticeLicenceSubmission from '../../../../app/services/notices/setup/returns-notice/process-licence-submission.service.js'

// Thing under test
import SubmitLicenceService from '../../../../app/services/notices/setup/submit-licence.service.js'

describe('Notices - Setup - Submit Licence service', () => {
  let licenceRef
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    licenceRef = LicenceHelper.generateLicenceRef()

    vi.useFakeTimers({ now: new Date('2020-06-06') })

    sessionData = {}

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    vi.spyOn(ProcessReturnsNoticeLicenceSubmission, 'default').mockResolvedValue({
      additionalSessionData: { dueReturns: [] },
      validationResult: null
    })

    vi.spyOn(ProcessRenewalsNoticeLicenceSubmission, 'default').mockResolvedValue({
      additionalSessionData: {},
      validationResult: null
    })

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { licenceRef }
      })

      it('saves the submitted value', async () => {
        await SubmitLicenceService(session.id, payload, yarStub)

        expect(session.licenceRef).toEqual(licenceRef)
        expect(session.$update).toHaveBeenCalled()
      })

      it('returns the redirect url', async () => {
        const result = await SubmitLicenceService(session.id, payload, yarStub)

        expect(result).toEqual({ redirectUrl: 'check-notice-type' })
      })

      describe('for a "paper return" notice type', () => {
        describe('and the check page has not been visited', () => {
          beforeEach(() => {
            sessionData = { noticeType: 'paperReturn', checkPageVisited: false }

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('returns a redirect to the "paper-return" page', async () => {
            const result = await SubmitLicenceService(session.id, payload, yarStub)

            expect(result).toEqual({ redirectUrl: 'paper-return' })
          })
        })

        describe('and the check page has been visited', () => {
          beforeEach(() => {
            sessionData = { noticeType: 'paperReturn', licenceRef, checkPageVisited: true }

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('returns a redirect to the "check-notice-type" page', async () => {
            const result = await SubmitLicenceService(session.id, payload, yarStub)

            expect(result).toEqual({ redirectUrl: 'check-notice-type' })
          })
        })
      })

      describe('for a "renewal invitation" notice type', () => {
        beforeEach(() => {
          sessionData = { checkPageVisited: false, noticeType: 'renewalInvitations' }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('calls the "ProcessRenewalsNoticeLicenceSubmission"', async () => {
          await SubmitLicenceService(session.id, payload, yarStub)

          expect(ProcessRenewalsNoticeLicenceSubmission.default).toHaveBeenCalledExactlyOnceWith(payload)
        })

        describe('and the check page has not been visited', () => {
          it('returns a redirect to the "check-notice-type" page', async () => {
            const result = await SubmitLicenceService(session.id, payload, yarStub)

            expect(result).toEqual({ redirectUrl: 'check-notice-type' })
          })
        })

        describe('and the check page has been visited', () => {
          beforeEach(() => {
            sessionData = { checkPageVisited: true, licenceRef, noticeType: 'renewalInvitations' }

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('returns a redirect to the "check-notice-type" page', async () => {
            const result = await SubmitLicenceService(session.id, payload, yarStub)

            expect(result).toEqual({ redirectUrl: 'check-notice-type' })
          })
        })
      })

      describe('and the journey is for "standard"', () => {
        describe('and the check page has been visited', () => {
          beforeEach(() => {
            sessionData = { journey: 'standard', licenceRef, checkPageVisited: true }

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('returns a redirect to the "check-notice-type" page', async () => {
            const result = await SubmitLicenceService(session.id, payload, yarStub)

            expect(result).toEqual({ redirectUrl: 'check-notice-type' })
          })
        })

        describe('and the check page has not been visited', () => {
          beforeEach(() => {
            sessionData = { journey: 'standard', checkPageVisited: false }

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('returns a redirect to the "returns-period" page', async () => {
            const result = await SubmitLicenceService(session.id, payload, yarStub)

            expect(result).toEqual({ redirectUrl: 'returns-period' })
          })
        })
      })

      describe('from the check page', () => {
        describe('and the licence ref has been updated', () => {
          beforeEach(() => {
            sessionData = { licenceRef: '01/11', checkPageVisited: true }

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('redirects to the check notice type page', async () => {
            const result = await SubmitLicenceService(session.id, payload, yarStub)

            expect(result.redirectUrl).toEqual('check-notice-type')
          })

          it('updates the sessions "checkPageVisited" flag', async () => {
            await SubmitLicenceService(session.id, payload, yarStub)

            expect(session.checkPageVisited).toBe(false)
          })

          it('sets a flash message', async () => {
            await SubmitLicenceService(session.id, payload, yarStub)

            const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

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

            session = SessionModelStub(sessionData)

            vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
          })

          it('redirects to the check notice type page', async () => {
            const result = await SubmitLicenceService(session.id, payload, yarStub)

            expect(result.redirectUrl).toEqual('check-notice-type')
          })

          it('does not set a flash message', async () => {
            await SubmitLicenceService(session.id, payload, yarStub)

            expect(yarStub.flash.mock.calls[0]).toBeUndefined()
          })
        })
      })
    })

    describe('fails validation', () => {
      beforeEach(() => {
        payload = {}

        vi.spyOn(ProcessReturnsNoticeLicenceSubmission, 'default').mockResolvedValue({
          additionalSessionData: { dueReturns: [] },
          validationResult: {
            errorList: [{ href: '#licenceRef', text: 'Enter a licence number' }],
            licenceRef: { text: 'Enter a licence number' }
          }
        })
      })

      it('returns page data needed to re-render the view including the validation error', async () => {
        const result = await SubmitLicenceService(session.id, payload, yarStub)

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
