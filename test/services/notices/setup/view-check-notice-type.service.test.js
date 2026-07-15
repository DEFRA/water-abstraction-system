// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateLicenceRef } from '../../../support/helpers/licence.helper.js'

// Test helpers
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewCheckNoticeTypeService from '../../../../app/services/notices/setup/view-check-notice-type.service.js'

describe('Notices - Setup - View Check Notice Type service', () => {
  let licenceRef
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    licenceRef = generateLicenceRef()
    sessionData = { licenceRef, noticeType: 'invitations' }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
    yarStub.flash.mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCheckNoticeTypeService(session.id, yarStub)

      expect(result).toEqual({
        activeNavBar: 'notices',
        licenceRef,
        links: {
          licenceNumber: `/system/notices/setup/${session.id}/licence`,
          noticeType: `/system/notices/setup/${session.id}/notice-type`,
          returns: `/system/notices/setup/${session.id}/paper-return`,
          returnsPeriod: `/system/notices/setup/${session.id}/returns-period`
        },
        notification: undefined,
        pageTitle: 'Check the notice type',
        noticeType: 'Returns invitation',
        sessionId: session.id
      })
    })

    it('should set the "checkPageVisited" flag', async () => {
      await ViewCheckNoticeTypeService(session.id, yarStub)

      expect(session.checkPageVisited).toBe(true)
      expect(session.$update).toHaveBeenCalled()
    })

    describe('when there is a notification', () => {
      beforeEach(() => {
        yarStub = YarStub()
        yarStub.flash.mockReturnValue(['Test notification'])
      })

      it('should set the notification', async () => {
        const result = await ViewCheckNoticeTypeService(session.id, yarStub)

        expect(result.notification).toEqual('Test notification')
      })
    })
  })
})
