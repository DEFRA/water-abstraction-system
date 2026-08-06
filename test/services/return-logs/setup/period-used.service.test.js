// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import PeriodUsedService from '../../../../src/services/return-logs/setup/period-used.service.js'

describe('Return Logs Setup - Period used service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      returnReference: '012345',
      periodStartDay: '01',
      periodStartMonth: '04',
      periodEndDay: '31',
      periodEndMonth: '03'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await PeriodUsedService(session.id)

      expect(result.sessionId).toEqual(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await PeriodUsedService(session.id)

      expect(result).toMatchObject({
        abstractionPeriod: '1 April to 31 March',
        backLink: { href: `/system/return-logs/setup/${session.id}/single-volume`, text: 'Back' },
        pageTitle: 'What period was used for this volume?',
        pageTitleCaption: 'Return reference 012345',
        periodDateUsedOptions: null,
        periodUsedFromDay: null,
        periodUsedFromMonth: null,
        periodUsedFromYear: null,
        periodUsedToDay: null,
        periodUsedToMonth: null,
        periodUsedToYear: null,
        showDefaultAbstractionPeriod: true
      })
    })
  })
})
