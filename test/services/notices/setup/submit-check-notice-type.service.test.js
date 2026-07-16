// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitCheckNoticeTypeService from '../../../../app/services/notices/setup/submit-check-notice-type.service.js'

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
    vi.restoreAllMocks()
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

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('adds the "addressJourney" property to the session configured for going back to contact-type', async () => {
        await SubmitCheckNoticeTypeService(sessionId)

        expect(session).toEqual({
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

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('adds the "addressJourney" property to the session configured for going back to recipient-name', async () => {
        await SubmitCheckNoticeTypeService(sessionId)

        expect(session).toEqual({
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
