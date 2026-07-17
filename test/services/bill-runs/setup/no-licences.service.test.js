// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import RegionHelper from '../../../support/helpers/region.helper.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import NoLicencesService from '../../../../app/services/bill-runs/setup/no-licences.service.js'

describe('Bill Runs - Setup - No Licences service', () => {
  const region = RegionHelper.select(RegionHelper.TEST_REGION_INDEX)

  let session
  let sessionData

  describe('when called with a valid session id', () => {
    beforeEach(() => {
      sessionData = { region: region.id }

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('returns page data for the view', async () => {
      const result = await NoLicencesService(session.id)

      expect(result).toEqual({
        activeNavBar: 'bill-runs',
        backlink: `/system/bill-runs/setup/${session.id}/region`,
        pageTitle: `There are no licences marked for two-part tariff supplementary billing in the ${region.displayName} region`,
        sessionId: session.id
      })
    })
  })
})
