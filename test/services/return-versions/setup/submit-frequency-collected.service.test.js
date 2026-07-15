// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitFrequencyCollectedService from '../../../../app/services/return-versions/setup/submit-frequency-collected.service.js'

describe('Return Versions Setup - Submit Frequency Collected service', () => {
  const requirementIndex = 0
  let payload
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
      requirements: [{}],
      startDateOptions: 'licenceStartDate',
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
          frequencyCollected: 'week'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitFrequencyCollectedService(session.id, requirementIndex, payload, yarStub)

        expect(session.requirements[0].frequencyCollected).toEqual('week')
        expect(session.$update).toHaveBeenCalled()
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitFrequencyCollectedService(session.id, requirementIndex, payload, yarStub)

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
          const result = await SubmitFrequencyCollectedService(session.id, requirementIndex, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: true
          })
        })

        it('sets the notification message title to "Updated" and the text to "Requirements for returns updated" ', async () => {
          await SubmitFrequencyCollectedService(session.id, requirementIndex, payload, yarStub)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({
            titleText: 'Updated',
            text: 'Requirements for returns updated'
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitFrequencyCollectedService(session.id, requirementIndex, payload, yarStub)

        expect(result).toMatchObject({
          pageTitle: 'Select how often readings or volumes are collected',
          pageTitleCaption: 'Licence 01/ABC',
          backLink: {
            href: `/system/return-versions/setup/${session.id}/site-description/0`,
            text: 'Back'
          },
          frequencyCollected: null,
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC'
        })
      })

      describe('because the user has not submitted anything', () => {
        it('includes an error for the input element', async () => {
          const result = await SubmitFrequencyCollectedService(session.id, requirementIndex, payload, yarStub)

          expect(result.error).toEqual({
            errorList: [
              {
                href: '#frequencyCollected',
                text: 'Select how often readings or volumes are collected'
              }
            ],
            frequencyCollected: { text: 'Select how often readings or volumes are collected' }
          })
        })
      })
    })
  })
})
