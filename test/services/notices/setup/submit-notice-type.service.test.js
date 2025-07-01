'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitNoticeTypeService = require('../../../../app/services/notices/setup/submit-notice-type.service.js')

describe('Notice Type Service', () => {
  let payload
  let session
  let sessionData
  let noticeType
  let yarStub

  beforeEach(async () => {
    noticeType = 'invitations'
    payload = { noticeType }
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('saves the notice type session data', async () => {
      await SubmitNoticeTypeService.go(session.id, payload, yarStub)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.equal({
        ...session,
        data: {
          journey: 'invitations',
          name: 'Returns: invitation',
          noticeType: 'invitations',
          notificationType: 'Returns invitation',
          referenceCode: refreshedSession.referenceCode,
          subType: 'returnInvitation'
        },
        journey: 'invitations',
        name: 'Returns: invitation',
        noticeType: 'invitations',
        notificationType: 'Returns invitation',
        referenceCode: refreshedSession.referenceCode,
        subType: 'returnInvitation'
      })
    })

    it('saves the submitted "noticeType"', async () => {
      await SubmitNoticeTypeService.go(session.id, payload, yarStub)

      const refreshedSession = await session.$query()

      expect(refreshedSession.noticeType).to.equal('invitations')
    })

    it('continues the journey', async () => {
      const result = await SubmitNoticeTypeService.go(session.id, payload, yarStub)

      expect(result).to.equal({ redirectUrl: 'check-notice-type' })
    })

    describe('and the notice types is "paper-forms"', () => {
      beforeEach(() => {
        noticeType = 'paper-forms'
        payload = { noticeType }
      })

      it('continues the journey', async () => {
        const result = await SubmitNoticeTypeService.go(session.id, payload)

        expect(result).to.equal({ redirectUrl: 'returns-for-paper-forms' })
      })
    })

    describe('and the user comes from the check page', () => {
      describe('and the notice type has been updated', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { noticeType: 'test', checkPageVisited: true } })
        })

        it('sets a flash message', async () => {
          await SubmitNoticeTypeService.go(session.id, payload, yarStub)

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(bannerMessage).to.equal({
            text: 'Notice type updated',
            title: 'Updated'
          })
        })
      })

      describe('and the notice type has not been updated', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { noticeType, checkPageVisited: true } })
        })

        it('does not set a flash message', async () => {
          await SubmitNoticeTypeService.go(session.id, payload, yarStub)

          expect(yarStub.flash.args[0]).to.be.undefined()
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitNoticeTypeService.go(session.id, payload, yarStub)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/licence`,
        error: { text: 'Select the notice type' },
        options: [
          {
            checked: false,
            text: 'Standard returns invitation',
            value: 'invitations'
          },
          {
            checked: false,
            text: 'Submit using a paper form invitation',
            value: 'paper-forms'
          }
        ],
        pageTitle: 'Select the notice type'
      })
    })
  })
})
