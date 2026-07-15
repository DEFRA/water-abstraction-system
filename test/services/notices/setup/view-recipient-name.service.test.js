// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateNoticeReferenceCode } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewRecipientNameService from '../../../../app/services/notices/setup/view-recipient-name.service.js'

describe('Notices - Setup - View Recipient Name service', () => {
  let referenceCode
  let session
  let sessionData

  beforeEach(() => {
    referenceCode = generateNoticeReferenceCode('RINV-')
    sessionData = { referenceCode }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewRecipientNameService(session.id)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/select-recipients`,
          text: 'Back'
        },
        name: undefined,
        pageTitle: "Enter the recipient's name",
        pageTitleCaption: `Notice ${referenceCode}`
      })
    })
  })
})
