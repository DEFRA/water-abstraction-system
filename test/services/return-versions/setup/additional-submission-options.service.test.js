// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import AdditionalSubmissionOptionsService from '../../../../src/services/return-versions/setup/additional-submission-options.service.js'

describe('Return Versions Setup - Additional Submission Options service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      checkPageVisited: false,
      journey: 'returns-required',
      licence: {
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceHolder: 'Turbo Kid',
        licenceRef: '01/ABC',
        startDate: '2022-04-01T00:00:00.000Z'
      },
      multipleUpload: false,
      noAdditionalOptions: undefined,
      reason: 'major-change',
      requirements: [{}],
      startDateOptions: 'licenceStartDate'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await AdditionalSubmissionOptionsService(session.id)

      expect(result.sessionId).toEqual(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await AdditionalSubmissionOptionsService(session.id)

      expect(result).toMatchObject({
        backLink: {
          href: `/system/return-versions/setup/${session.id}/check`,
          text: 'Back'
        },
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        multipleUpload: false,
        noAdditionalOptions: undefined,
        pageTitle: 'Select any additional submission options for the return requirements',
        pageTitleCaption: 'Licence 01/ABC',
        quarterlyReturns: undefined,
        quarterlyReturnSubmissions: false
      })
    })
  })
})
