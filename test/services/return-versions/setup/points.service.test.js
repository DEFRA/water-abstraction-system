// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import PointModel from 'water-abstraction-engine/models/point.model.js'
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Things we need to stub
import * as FetchPointsService from '../../../../src/services/return-versions/setup/fetch-points.service.js'

// Thing under test
import SelectPointsService from '../../../../src/services/return-versions/setup/points.service.js'

describe('Return Versions - Setup - Points service', () => {
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

    const point = PointModel.fromJson({
      description: 'RIVER MEDWAY AT YALDING INTAKE',
      id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
      ngr1: 'TQ 69212 50394',
      ngr2: null,
      ngr3: null,
      ngr4: null
    })

    vi.spyOn(FetchPointsService, 'default').mockResolvedValue([point])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await SelectPointsService(session.id, requirementIndex)

      expect(result.sessionId).toEqual(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await SelectPointsService(session.id, requirementIndex)

      expect(result).toMatchObject({
        backLink: {
          href: `/system/return-versions/setup/${session.id}/purpose/0`,
          text: 'Back'
        },
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licencePoints: [
          {
            description: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
            id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6'
          }
        ],
        licenceRef: '01/ABC',
        pageTitle: 'Select the points for the requirements for returns',
        pageTitleCaption: 'Licence 01/ABC',
        selectedPointIds: ''
      })
    })
  })
})
