// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitSeasonService from '../../../../app/services/bill-runs/setup/submit-season.service.js'

describe('Bill Runs - Setup - Submit Season service', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {}

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          season: 'summer'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitSeasonService(session.id, payload)

        expect(session.season).toEqual('summer')
        expect(session.$update.called).toBe(true)
      })

      it('returns an empty object (no page data is needed for a redirect)', async () => {
        const result = await SubmitSeasonService(session.id, payload)

        expect(result).toEqual({})
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitSeasonService(session.id, payload)

          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            backlink: `/system/bill-runs/setup/${session.id}/year`,
            error: {
              text: 'Select the season'
            },
            pageTitle: 'Select the season',
            sessionId: session.id,
            selectedSeason: null
          })
        })
      })
    })
  })
})
