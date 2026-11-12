// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Things we need to stub
import * as FetchPurposesService from '../../../../src/services/return-versions/setup/fetch-purposes.service.js'

// Thing under test
import PurposeService from '../../../../src/services/return-versions/setup/purpose.service.js'

describe('Return Versions - Setup - Purpose service', () => {
  const requirementIndex = 0

  let session
  let sessionData

  beforeEach(() => {
    vi.spyOn(FetchPurposesService, 'default').mockResolvedValue([
      { description: 'Heat Pump', id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f' },
      { description: 'Horticultural Watering', id: '49088608-ee9f-491a-8070-6831240945ac' }
    ])

    sessionData = {
      checkPageVisited: false,
      journey: 'returns-required',
      licence: {
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceHolder: 'Turbo Kid',
        licenceRef: '01/ABC',
        returnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            modLogs: [],
            reason: null,
            startDate: '2023-01-01T00:00:00.000Z'
          }
        ],
        startDate: '2022-04-01T00:00:00.000Z',
        waterUndertaker: false
      },
      licenceVersion: {
        copyableReturnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            modLogs: [],
            reason: null,
            startDate: '2023-01-01T00:00:00.000Z'
          }
        ],
        endDate: null,
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        startDate: '2022-04-01T00:00:00.000Z'
      },
      multipleUpload: false,
      reason: 'major-change',
      requirements: [{}],
      returnVersionStartDate: '2023-01-01T00:00:00.000Z',
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
      const result = await PurposeService(session.id, requirementIndex)

      expect(result.sessionId).toEqual(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await PurposeService(session.id, requirementIndex)

      expect(result).toEqual({
        backLink: {
          href: `/system/return-versions/setup/${session.id}/method`,
          text: 'Back'
        },
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        pageTitle: 'Select the purpose for the requirements for returns',
        pageTitleCaption: 'Licence 01/ABC',
        purposes: [
          { alias: '', checked: false, description: 'Heat Pump', id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f' },
          {
            alias: '',
            checked: false,
            description: 'Horticultural Watering',
            id: '49088608-ee9f-491a-8070-6831240945ac'
          }
        ],
        sessionId: session.id
      })
    })
  })
})
