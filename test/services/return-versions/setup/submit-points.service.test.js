// Test helpers
import PointModel from '../../../../app/models/point.model.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchPointsService from '../../../../app/services/return-versions/setup/fetch-points.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitPointsService from '../../../../app/services/return-versions/setup/submit-points.service.js'

describe('Return Versions - Setup - Submit Points service', () => {
  const requirementIndex = 0
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
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
        startDate: '2022-04-01T00:00:00.000Z',
        waterUndertaker: false
      },
      multipleUpload: false,
      journey: 'returns-required',
      requirements: [{}],
      startDateOptions: 'licenceStartDate',
      returnVersionStartDate: '2023-01-01T00:00:00.000Z',
      licenceVersion: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        endDate: null,
        startDate: '2022-04-01T00:00:00.000Z',
        copyableReturnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            startDate: '2023-01-01T00:00:00.000Z',
            reason: null,
            modLogs: []
          }
        ]
      },
      reason: 'major-change'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
    yarStub.flash.mockReturnValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          points: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6'
        }

        vi.spyOn(FetchPointsService, 'default').mockResolvedValue(_points())
      })

      it('saves the submitted value', async () => {
        await SubmitPointsService(session.id, requirementIndex, payload, yarStub)

        expect(session.requirements[0].points).toEqual(['d03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6'])
        expect(session.$update).toHaveBeenCalled()
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitPointsService(session.id, requirementIndex, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: false
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(() => {
          session = SessionModelStub({
            ...sessionData,
            checkPageVisited: true
          })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitPointsService(session.id, requirementIndex, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: true
          })
        })

        it('sets the notification message title to "Updated" and the text to "Requirements for returns updated" ', async () => {
          await SubmitPointsService(session.id, requirementIndex, payload, yarStub)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({
            titleText: 'Updated',
            text: 'Requirements for returns updated'
          })
        })
      })
    })
  })

  describe('with a invalid payload', () => {
    beforeEach(() => {
      payload = {}

      vi.spyOn(FetchPointsService, 'default').mockResolvedValue(_points())
    })

    it('returns page data for the view', async () => {
      const result = await SubmitPointsService(session.id, requirementIndex, payload, yarStub)

      expect(result).toMatchObject({
        pageTitle: 'Select the points for the requirements for returns',
        pageTitleCaption: 'Licence 01/ABC',
        backLink: {
          href: `/system/return-versions/setup/${session.id}/purpose/0`,
          text: 'Back'
        },
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licencePoints: [
          {
            id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
            description: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
          }
        ],
        licenceRef: '01/ABC',
        selectedPointIds: ''
      })
    })

    describe('because the user has not submitted anything', () => {
      it('includes an error for the input element', async () => {
        const result = await SubmitPointsService(session.id, requirementIndex, payload, yarStub)

        expect(result.error).toEqual({
          errorList: [
            {
              href: '#points',
              text: 'Select any points for the requirements for returns'
            }
          ],
          points: { text: 'Select any points for the requirements for returns' }
        })
      })
    })
  })
})

function _points() {
  const point = PointModel.fromJson({
    description: 'RIVER MEDWAY AT YALDING INTAKE',
    id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
    ngr1: 'TQ 69212 50394',
    ngr2: null,
    ngr3: null,
    ngr4: null
  })

  return [point]
}
