// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewLicenceService from '../../../../app/services/notices/setup/view-licence.service.js'

describe('Notices - Setup - View Licence service', () => {
  let licenceRef
  let session
  let sessionData

  beforeEach(() => {
    licenceRef = LicenceHelper.generateLicenceRef()

    sessionData = { licenceRef }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicenceService(session.id)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/notice-type`,
          text: 'Back'
        },
        licenceRef,
        pageTitle: 'Enter a licence number'
      })
    })
  })
})
