'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const YarStub = require('../../../support/stubs/yar.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitNoticeTypeService = require('../../../../app/services/notices/setup/submit-notice-type.service.js')

describe('Notices - Setup - Submit Notice Type service', () => {
  let auth
  let fetchSessionStub
  let payload
  let session
  let sessionData
  let noticeType
  let yarStub

  beforeEach(() => {
    auth = {
      credentials: { scope: ['bulk_return_notifications'] }
    }

    noticeType = 'invitations'
    payload = { noticeType }
    sessionData = {}

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = YarStub.build(Sinon)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('saves the notice type session data', async () => {
      await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

      expect(session).toEqual(session)
      expect(session.$update.called).toBe(true)
    })

    it('saves the submitted "noticeType"', async () => {
      await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

      expect(session.noticeType).toEqual('invitations')
    })

    it('returns a redirect to the "licence" page', async () => {
      const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

      expect(result).toEqual({ redirectUrl: 'licence' })
    })

    describe('and the user comes from the check page', () => {
      describe('and the notice type has been updated', () => {
        beforeEach(() => {
          session = SessionModelStub.build(Sinon, {
            checkPageVisited: true,
            noticeType: 'test'
          })

          fetchSessionStub.resolves(session)
        })

        it('redirects to the licence page', async () => {
          const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          expect(result).toEqual({ redirectUrl: 'licence' })
        })

        it('updates the sessions "checkPageVisited" flag', async () => {
          await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          expect(session.checkPageVisited).toBe(false)
          expect(session.$update.called).toBe(true)
        })

        it('sets a flash message', async () => {
          await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.args[0]

          expect(flashType).toEqual('notification')
          expect(bannerMessage).toEqual({
            text: 'Notice type updated',
            titleText: 'Updated'
          })
        })
      })

      describe('and the notice type has not been updated', () => {
        beforeEach(() => {
          session = SessionModelStub.build(Sinon, {
            noticeType,
            checkPageVisited: true
          })

          fetchSessionStub.resolves(session)
        })

        it('does not update the session "checkPageVisited" flag', async () => {
          await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          expect(session.checkPageVisited).toBe(true)
          expect(session.$update.called).toBe(true)
        })

        it('does not set a flash message', async () => {
          await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          expect(yarStub.flash.args[0]).toBeUndefined()
        })
      })
    })

    describe('and the journey is for "standard"', () => {
      describe('and the check page has been visited', () => {
        beforeEach(() => {
          sessionData.journey = 'standard'
          sessionData.checkPageVisited = true
          sessionData.noticeType = noticeType

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('returns a redirect to the "/check-notice-type" page', async () => {
          const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          expect(result).toEqual({ redirectUrl: 'check-notice-type' })
        })
      })

      describe('and the check page has not been visited', () => {
        beforeEach(() => {
          sessionData.journey = 'standard'
          sessionData.checkPageVisited = false

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('returns a redirect to the "/returns-period" page', async () => {
          const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          expect(result).toEqual({ redirectUrl: 'returns-period' })
        })
      })
    })

    describe('the "redirect" property', () => {
      describe('and the check page has been visited', () => {
        beforeEach(() => {
          sessionData.journey = 'adhoc'
          sessionData.checkPageVisited = true
          sessionData.noticeType = noticeType

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('returns a redirect to the "/check-notice-type" page', async () => {
          const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          expect(result).toEqual({ redirectUrl: 'check-notice-type' })
        })
      })

      describe('and the check page has not been visited', () => {
        beforeEach(async () => {
          sessionData.journey = 'adhoc'
          sessionData.checkPageVisited = false

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('returns a redirect to the "licence" page', async () => {
          const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

          expect(result).toEqual({ redirectUrl: 'licence' })
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitNoticeTypeService(session.id, payload, yarStub, auth)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices`,
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#noticeType',
              text: 'Select the notice type'
            }
          ],
          noticeType: {
            text: 'Select the notice type'
          }
        },
        options: [
          {
            checked: false,
            text: 'Returns invitation',
            value: 'invitations'
          },
          {
            checked: false,
            text: 'Returns reminder',
            value: 'reminders'
          }
        ],
        pageTitle: 'Select the notice type'
      })
    })
  })
})
