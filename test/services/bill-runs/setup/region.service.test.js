// Test framework dependencies

// Test helpers
import * as RegionHelper from '../../../support/helpers/region.helper.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchRegionsService from '../../../../app/services/bill-runs/setup/fetch-regions.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import RegionService from '../../../../app/services/bill-runs/setup/region.service.js'

describe('Bill Runs - Setup - Region service', () => {
  let session
  let sessionData
  let regions
  let region

  beforeEach(() => {
    regions = RegionHelper.data
    region = RegionHelper.select()

    sessionData = { region: region.id }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    vi.spyOn(FetchRegionsService, 'default').mockResolvedValue(regions)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await RegionService(session.id)

      expect(result).toEqual({
        activeNavBar: 'bill-runs',
        backlink: `/system/bill-runs/setup/${session.id}/type`,
        pageTitle: 'Select the region',
        regions,
        sessionId: session.id,
        selectedRegion: region.id
      })
    })
  })
})
