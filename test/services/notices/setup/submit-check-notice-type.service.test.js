'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitCheckNoticeTypeService = require('../../../../app/services/notices/setup/submit-check-notice-type.service.js')

describe('Notices - Setup - Submit Check Notice Type service', () => {
  let session
  let sessionData
  let sessionId

  beforeEach(() => {
    sessionId = generateUUID()

    sessionData = {
      dueReturns: [],
      licenceRef: '01/123',
      journey: 'adhoc'
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the notice type is not "paperReturn"', () => {
      beforeEach(() => {
        sessionData.name = 'Returns: invitation'
        sessionData.noticeType = 'invitations'
        sessionData.notificationType = 'Returns invitation'
        sessionData.referenceCode = `RINV-${Math.floor(1000 + Math.random() * 9000).toString()}`
        sessionData.subType = 'returnInvitation'

        sessionData.id = sessionId

        session = SessionModelStub.build(Sinon, sessionData)

        Sinon.stub(FetchSessionDal, 'go').resolves(session)
      })

      it('adds the "addressJourney" property to the session configured for going back to contact-type', async () => {
        await SubmitCheckNoticeTypeService.go(sessionId)

        expect(session).to.equal({
          dueReturns: [],
          id: sessionId,
          licenceRef: '01/123',
          journey: 'adhoc',
          name: 'Returns: invitation',
          noticeType: 'invitations',
          notificationType: 'Returns invitation',
          referenceCode: sessionData.referenceCode,
          subType: 'returnInvitation',
          addressJourney: {
            activeNavBar: 'notices',
            address: {},
            backLink: {
              href: `/system/notices/setup/${sessionId}/contact-type`,
              text: 'Back'
            },
            pageTitleCaption: `Notice ${sessionData.referenceCode}`,
            redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`
          }
        })
      })
    })

    describe('and the notice type is "paperReturn"', () => {
      beforeEach(() => {
        sessionData.name = 'Paper returns'
        sessionData.noticeType = 'paperReturn'
        sessionData.notificationType = 'Paper returns'
        sessionData.referenceCode = `PRTF-${Math.floor(1000 + Math.random() * 9000).toString()}`
        sessionData.subType = 'paperReturnForms'

        sessionData.id = sessionId

        session = SessionModelStub.build(Sinon, sessionData)

        Sinon.stub(FetchSessionDal, 'go').resolves(session)
      })

      it('adds the "addressJourney" property to the session configured for going back to recipient-name', async () => {
        await SubmitCheckNoticeTypeService.go(sessionId)

        expect(session).to.equal({
          dueReturns: [],
          id: sessionId,
          licenceRef: '01/123',
          journey: 'adhoc',
          name: 'Paper returns',
          noticeType: 'paperReturn',
          notificationType: 'Paper returns',
          referenceCode: sessionData.referenceCode,
          subType: 'paperReturnForms',
          addressJourney: {
            activeNavBar: 'notices',
            address: {},
            backLink: {
              href: `/system/notices/setup/${sessionId}/recipient-name`,
              text: 'Back'
            },
            pageTitleCaption: `Notice ${sessionData.referenceCode}`,
            redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`
          }
        })
      })
    })
  })
})
