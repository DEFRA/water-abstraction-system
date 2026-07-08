// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SingleVolumeService from '../../../../app/services/return-logs/setup/single-volume.service.js'

describe('Return Logs Setup - Single Volume service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      returnReference: '012345',
      units: 'cubicMetres'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await SingleVolumeService(session.id)

      expect(result.sessionId).toEqual(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await SingleVolumeService(session.id)

      expect(result).toMatchObject({
        backLink: { href: `/system/return-logs/setup/${session.id}/meter-provided`, text: 'Back' },
        pageTitle: 'Is it a single volume?',
        pageTitleCaption: 'Return reference 012345',
        singleVolume: null,
        singleVolumeQuantity: null,
        units: 'cubic metres'
      })
    })
  })
})
