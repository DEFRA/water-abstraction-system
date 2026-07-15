// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateNoticeReferenceCode } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewCancelService from '../../../../app/services/notices/setup/view-cancel.service.js'

describe('Notices - Setup - View Cancel service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = { licenceRef: '01/111', referenceCode: generateNoticeReferenceCode('RINV-') }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCancelService(session.id)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/check`,
          text: 'Back'
        },
        pageTitle: 'You are about to cancel this notice',
        pageTitleCaption: `Notice ${session.referenceCode}`,
        summaryList: {
          text: 'Licence number',
          value: '01/111'
        }
      })
    })
  })
})
