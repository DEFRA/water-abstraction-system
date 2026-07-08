// Test helpers
import SessionModelStub from '__STUBS_SESSION_PATH__'

// Things we need to stub
import FetchSessionDal from '__FETCH_SESSION_DAL_TEST_PATH__'

// Thing under test
import __MODULE_NAME__ from '__REQUIRE_PATH__'

describe('__DESCRIBE_LABEL__', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {}

    session = SessionModelStub.build(sessionData)

    vi.mock('__FETCH_SESSION_DAL_TEST_PATH__')
    FetchSessionDal.mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await __MODULE_NAME__(session.id)

      expect(result).toEqual({
        backLink: {
          href: '',
          text: 'Back'
        },
        pageTitle: ''
      })
    })
  })
})
