// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import RegionHelper from 'water-abstraction-engine/test/helpers/region.helper.js'
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import * as FetchRegionsService from '../../../../src/services/bill-runs/setup/fetch-regions.service.js'

// Thing under test
import RegionService from '../../../../src/services/bill-runs/setup/region.service.js'

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
