// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ReadingsService from '../../../../app/services/return-logs/setup/readings.service.js'

describe('Return Logs Setup - Readings service', () => {
  const yearMonth = '2023-3'

  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      lines: [
        {
          endDate: '2023-04-30T00:00:00.000Z',
          reading: 100,
          startDate: '2023-04-01T00:00:00.000Z'
        },
        {
          endDate: '2023-05-31T00:00:00.000Z',
          startDate: '2023-05-01T00:00:00.000Z'
        }
      ],
      returnsFrequency: 'month',
      returnReference: '1234'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ReadingsService(session.id, yearMonth)

      expect(result).toEqual({
        backLink: {
          href: `/system/return-logs/setup/${session.id}/check`,
          text: 'Back'
        },
        inputLines: [
          {
            endDate: '2023-04-30T00:00:00.000Z',
            label: 'April 2023',
            reading: '100',
            viewId: 'April2023'
          }
        ],
        pageTitle: 'Water abstracted April 2023',
        pageTitleCaption: 'Return reference 1234'
      })
    })
  })
})
