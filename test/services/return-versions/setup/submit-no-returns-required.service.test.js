// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitNoReturnsRequiredService from '../../../../app/services/return-versions/setup/submit-no-returns-required.service.js'

describe('Return Versions Setup - Submit No Returns Required service', () => {
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
      journey: 'no-returns-required',
      requirements: [{}],
      startDateOptions: 'licenceStartDate'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          reason: 'abstraction-below-100-cubic-metres-per-day'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitNoReturnsRequiredService(session.id, payload)

        expect(session.reason).toEqual('abstraction-below-100-cubic-metres-per-day')
        expect(session.$update).toHaveBeenCalled()
      })

      it('returns the correct details the controller needs to redirect the journey', async () => {
        const result = await SubmitNoReturnsRequiredService(session.id, payload, yarStub)

        expect(result).toEqual({ checkPageVisited: false, journey: 'no-returns-required' })
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
          const result = await SubmitNoReturnsRequiredService(session.id, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: true,
            journey: 'no-returns-required'
          })
        })

        it('sets the notification message title to "Updated" and the text to "Return version updated" ', async () => {
          await SubmitNoReturnsRequiredService(session.id, payload, yarStub)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({ titleText: 'Updated', text: 'Return version updated' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitNoReturnsRequiredService(session.id, payload)

        expect(result).toMatchObject({
          pageTitle: 'Why are no returns required?',
          pageTitleCaption: 'Licence 01/ABC',
          backLink: {
            href: `/system/return-versions/setup/${session.id}/start-date`,
            text: 'Back'
          },
          licenceRef: '01/ABC',
          reason: null
        })
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the input element', async () => {
          const result = await SubmitNoReturnsRequiredService(session.id, payload)

          expect(result.error).toEqual({
            errorList: [
              {
                href: '#reason',
                text: 'Select the reason for no returns required'
              }
            ],
            reason: { text: 'Select the reason for no returns required' }
          })
        })
      })
    })
  })
})
