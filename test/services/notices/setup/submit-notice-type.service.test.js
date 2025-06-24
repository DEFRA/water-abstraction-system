'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
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

  beforeEach(async () => {
    noticeType = 'invitations'
    payload = { noticeType }
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('saves the notice type session data', async () => {
      await SubmitNoticeTypeService.go(session.id, payload)

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
      await SubmitNoticeTypeService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.noticeType).to.equal('invitations')
    })

    it('continues the journey', async () => {
      const result = await SubmitNoticeTypeService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitNoticeTypeService.go(session.id, payload)

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
            value: 'paper-invitation'
          }
        ],
        pageTitle: 'Select the notice type'
      })
    })
  })
})
