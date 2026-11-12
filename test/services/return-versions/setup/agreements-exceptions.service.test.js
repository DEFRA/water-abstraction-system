// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import AgreementsExceptionsService from '../../../../src/services/return-versions/setup/agreements-exceptions.service.js'

describe('Return Versions Setup - Agreements Exceptions service', () => {
  const requirementIndex = 0

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
      const result = await AgreementsExceptionsService(session.id, requirementIndex)

      expect(result.sessionId).toEqual(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await AgreementsExceptionsService(session.id, requirementIndex)

      expect(result).toMatchObject({
        agreementsExceptions: null,
        backLink: {
          href: `/system/return-versions/setup/${session.id}/frequency-reported/0`,
          text: 'Back'
        },
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        pageTitle: 'Select agreements and exceptions for the requirements for returns',
        pageTitleCaption: 'Licence 01/ABC'
      })
    })
  })
})
