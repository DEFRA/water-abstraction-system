// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitRemoveService from '../../../../app/services/return-versions/setup/submit-remove.service.js'

describe('Return Versions Setup - Submit Remove service', () => {
  const requirementIndex = 0

  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      checkPageVisited: false,
      licence: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Turbo Kid',
        returnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            startDate: '2023-01-01T00:00:00.000Z',
            reason: null,
            modLogs: []
          }
        ],
        startDate: '2022-04-01T00:00:00.000Z'
      },
      journey: 'returns-required',
      requirements: [
        {
          points: ['At National Grid Reference TQ 6520 5937 (POINT A, ADDINGTON SANDPITS)'],
          purposes: [{ alias: '', description: 'Mineral Washing', id: '3a865331-d2f3-4acc-ac85-527fa2b0d2dd' }],
          returnsCycle: 'winter-and-all-year',
          siteDescription: 'Bore hole in rear field',
          abstractionPeriod: {
            abstractionPeriodEndDay: '31',
            abstractionPeriodEndMonth: '10',
            abstractionPeriodStartDay: '01',
            abstractionPeriodStartMonth: '04'
          },
          frequencyReported: 'month',
          frequencyCollected: 'month',
          agreementsExceptions: ['none']
        }
      ],
      startDateOptions: 'licenceStartDate',
      reason: 'major-change'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a user submits the return requirements to be removed', () => {
    it('deletes the selected requirement from the session data', async () => {
      await SubmitRemoveService(session.id, requirementIndex, yarStub)

      expect(session.requirements[requirementIndex]).toBeUndefined()
      expect(session.$update.called).toBe(true)
    })

    it('sets the notification message to "Requirements removed"', async () => {
      await SubmitRemoveService(session.id, requirementIndex, yarStub)

      const [flashType, notification] = yarStub.flash.mock.calls[0]

      expect(flashType).toEqual('notification')
      expect(notification).toEqual({ title: 'Removed', text: 'Requirement removed' })
    })
  })
})
