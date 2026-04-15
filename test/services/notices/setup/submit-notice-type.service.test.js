'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

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

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('saves the notice type session data', async () => {
      await SubmitNoticeTypeService.go(session.id, payload, yarStub, auth)

      expect(session).to.equal(session)
      expect(session.$update.called).to.be.true()
    })

    it('saves the submitted "noticeType"', async () => {
      await SubmitNoticeTypeService.go(session.id, payload, yarStub, auth)

      expect(session.noticeType).to.equal('invitations')
    })

    it('returns a redirect to the "/check-notice-type" page', async () => {
      const result = await SubmitNoticeTypeService.go(session.id, payload, yarStub, auth)

      expect(result).to.equal({ redirectUrl: 'check-notice-type' })
    })

    describe('and the notice types is "paperReturn"', () => {
      describe('and the check page has been visited', () => {
        beforeEach(() => {
          sessionData.checkPageVisited = true

          noticeType = 'paperReturn'
          payload = { noticeType }

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('continues the journey', async () => {
          const result = await SubmitNoticeTypeService.go(session.id, payload, yarStub, auth)

          expect(result).to.equal({ redirectUrl: 'paper-return' })
        })
      })

      describe('and the check page has not been visited', () => {
        beforeEach(() => {
          sessionData.checkPageVisited = false

          noticeType = 'paperReturn'
          payload = { noticeType }

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('continues the journey', async () => {
          const result = await SubmitNoticeTypeService.go(session.id, payload, yarStub, auth)

          expect(result).to.equal({ redirectUrl: 'paper-return' })
        })
      })
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

        it('updates the sessions "checkPageVisited" flag', async () => {
          await SubmitNoticeTypeService.go(session.id, payload, yarStub, auth)

          expect(session.checkPageVisited).to.be.false()
          expect(session.$update.called).to.be.true()
        })

        it('sets a flash message', async () => {
          await SubmitNoticeTypeService.go(session.id, payload, yarStub, auth)

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(bannerMessage).to.equal({
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
          await SubmitNoticeTypeService.go(session.id, payload, yarStub, auth)

          expect(session.checkPageVisited).to.be.true()
          expect(session.$update.called).to.be.true()
        })

        it('does not set a flash message', async () => {
          await SubmitNoticeTypeService.go(session.id, payload, yarStub, auth)

          expect(yarStub.flash.args[0]).to.be.undefined()
        })
      })
    })

    describe('and the journey is for "standard"', () => {
      describe('and the check page has been visited', () => {
        beforeEach(() => {
          sessionData.journey = 'standard'
          sessionData.checkPageVisited = true

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('returns a redirect to the "/check-notice-type" page', async () => {
          const result = await SubmitNoticeTypeService.go(session.id, payload, yarStub, auth)

          expect(result).to.equal({ redirectUrl: 'check-notice-type' })
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
          const result = await SubmitNoticeTypeService.go(session.id, payload, yarStub, auth)

          expect(result).to.equal({ redirectUrl: 'returns-period' })
        })
      })
    })

    describe('and the journey is "adhoc"', () => {
      describe('and the check page has been visited', () => {
        beforeEach(() => {
          sessionData.journey = 'adhoc'
          sessionData.checkPageVisited = true

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('returns a redirect to the "/check-notice-type" page', async () => {
          const result = await SubmitNoticeTypeService.go(session.id, payload, yarStub, auth)

          expect(result).to.equal({ redirectUrl: 'check-notice-type' })
        })
      })

      describe('and the check page has not been visited', () => {
        beforeEach(async () => {
          sessionData.journey = 'adhoc'
          sessionData.checkPageVisited = false

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('returns a redirect to the "/check-notice-type" page', async () => {
          const result = await SubmitNoticeTypeService.go(session.id, payload, yarStub, auth)

          expect(result).to.equal({ redirectUrl: 'check-notice-type' })
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitNoticeTypeService.go(session.id, payload, yarStub, auth)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/licence`,
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
