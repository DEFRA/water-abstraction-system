// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import RegionHelper from '../../../support/helpers/region.helper.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchRegionsService from '../../../../app/services/bill-runs/setup/fetch-regions.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitRegionService from '../../../../app/services/bill-runs/setup/submit-region.service.js'

describe('Bill Runs - Setup - Submit Region service', () => {
  let payload
  let region
  let regions
  let session
  let sessionData

  beforeEach(() => {
    regions = RegionHelper.data
    region = RegionHelper.select()

    sessionData = {}

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    vi.spyOn(FetchRegionsService, 'default').mockResolvedValue(regions)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          region: region.id
        }
      })

      describe('and the bill run type was not two-part tariff', () => {
        beforeEach(() => {
          sessionData = { type: 'annual' }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('saves the submitted region ID and its name and returns an object confirming setup is complete', async () => {
          const result = await SubmitRegionService(session.id, payload)

          expect(session.region).toEqual(region.id)
          expect(session.regionName).toEqual(region.displayName)
          expect(result.setupComplete).toBe(true)
        })
      })

      describe('and the bill run type was two-part tariff', () => {
        beforeEach(() => {
          sessionData = { type: 'two_part_tariff' }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('saves the submitted region ID and its name and returns an object confirming setup is not complete', async () => {
          const result = await SubmitRegionService(session.id, payload)

          expect(session.region).toEqual(region.id)
          expect(session.regionName).toEqual(region.displayName)
          expect(result.setupComplete).toBe(false)
        })
      })

      describe('and the bill run type was two-part tariff supplementary', () => {
        beforeEach(() => {
          sessionData = { type: 'two_part_supplementary' }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('saves the submitted region ID and its name and returns an object confirming setup is not complete', async () => {
          const result = await SubmitRegionService(session.id, payload)

          expect(session.region).toEqual(region.id)
          expect(session.regionName).toEqual(region.displayName)
          expect(result.setupComplete).toBe(false)
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        beforeEach(() => {
          payload = {}

          sessionData = { type: 'annual' }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitRegionService(session.id, payload)

          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            backlink: `/system/bill-runs/setup/${session.id}/type`,
            error: {
              text: 'Select the region'
            },
            pageTitle: 'Select the region',
            regions,
            sessionId: session.id,
            selectedRegion: null
          })
        })
      })
    })
  })
})
