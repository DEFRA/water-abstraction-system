// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateNoticeReferenceCode } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewRemoveLicencesService from '../../../../app/services/notices/setup/view-remove-licences.service.js'

describe('Notices - Setup - View Remove Licences service', () => {
  const licences = []

  let referenceCode
  let session
  let sessionData

  beforeEach(() => {
    referenceCode = generateNoticeReferenceCode()

    sessionData = { licences, referenceCode }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('correctly presents the data', async () => {
    const result = await ViewRemoveLicencesService(session.id)

    expect(result).toEqual({
      activeNavBar: 'notices',
      backLink: {
        href: `/system/notices/setup/${session.id}/check`,
        text: 'Back'
      },
      hint: 'Separate the licences numbers with a comma or new line.',
      pageTitle: 'Enter the licence numbers to remove from the mailing list',
      pageTitleCaption: `Notice ${referenceCode}`,
      removeLicences: []
    })
  })
})
