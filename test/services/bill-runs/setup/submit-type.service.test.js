// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitTypeService from '../../../../app/services/bill-runs/setup/submit-type.service.js'

describe('Bill Runs - Setup - Submit Type service', () => {
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
          type: 'annual'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitTypeService(session.id, payload)

        expect(session.type).toEqual('annual')
      })

      it('returns an empty object (no page data is needed for a redirect)', async () => {
        const result = await SubmitTypeService(session.id, payload)

        expect(result).toEqual({})
        expect(session.$update.called).toBe(true)
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitTypeService(session.id, payload)

          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            backlink: '/system/bill-runs',
            error: {
              text: 'Select the bill run type'
            },
            pageTitle: 'Select the bill run type',
            sessionId: session.id,
            selectedType: null
          })
        })
      })
    })
  })
})
