'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

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

  describe('when called', () => {
    describe('and the notice type is "invitations"', () => {
      beforeEach(async () => {
        sessionData.name = 'Returns: invitation'
        sessionData.noticeType = 'invitations'
        sessionData.notificationType = 'Returns invitation'
        sessionData.referenceCode = `RINV-${Math.floor(1000 + Math.random() * 9000).toString()}`
        sessionData.subType = 'returnInvitation'

        session = await SessionHelper.add({ id: sessionId, data: sessionData })
      })

      it('adds the "addressJourney" property to the session configured for going back to contact-type', async () => {
        await SubmitCheckNoticeTypeService.go(sessionId)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal({
          dueReturns: [],
          licenceRef: '01/123',
          journey: 'adhoc',
          name: 'Returns: invitation',
          noticeType: 'invitations',
          notificationType: 'Returns invitation',
          referenceCode: sessionData.referenceCode,
          subType: 'returnInvitation',
          addressJourney: {
            address: {},
            backLink: {
              href: `/system/notices/setup/${sessionId}/contact-type`,
              text: 'Back'
            },
            redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`,
            activeNavBar: 'manage'
          }
        })
      })
    })

    describe('and the notice type is "returnForms"', () => {
      beforeEach(async () => {
        sessionData.name = 'Paper returns'
        sessionData.noticeType = 'returnForms'
        sessionData.notificationType = 'Paper invitation'
        sessionData.referenceCode = `PRTF-${Math.floor(1000 + Math.random() * 9000).toString()}`
        sessionData.subType = 'paperReturnForms'

        session = await SessionHelper.add({ id: sessionId, data: sessionData })
      })

      it('adds the "addressJourney" property to the session configured for going back to contact-type', async () => {
        await SubmitCheckNoticeTypeService.go(sessionId)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal({
          dueReturns: [],
          licenceRef: '01/123',
          journey: 'adhoc',
          name: 'Paper returns',
          noticeType: 'returnForms',
          notificationType: 'Paper invitation',
          referenceCode: sessionData.referenceCode,
          subType: 'paperReturnForms',
          addressJourney: {
            address: {},
            backLink: {
              href: `/system/notices/setup/${sessionId}/contact-type`,
              text: 'Back'
            },
            redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`,
            activeNavBar: 'manage'
          }
        })
      })
    })
  })
})
